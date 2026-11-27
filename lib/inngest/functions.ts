import { inngest } from "./client"
import prisma, { $Enums } from "lib/prisma"
import { sendPaymentConfirmationMail } from "../mail"
import { getOrderStatus } from "../kado/client"
import { completePurchase } from "../kado/server"
import {
  fulfillSolanaPurchase,
  getPurchaseByKadoOrderId,
  getPurchaseByNonce,
  updatePurchaseKadoOrderId,
} from "../purchase/server"
import { NonRetriableError, RetryAfterError } from "inngest"
import { Prisma } from "@prisma/client"
import {
  EMAIL_CONFIRMATION_BATCH_SIZE,
  EMAIL_CONFIRMATION_THROTTLE_LIMIT,
  EMAIL_CONFIRMATION_THROTTLE_PERIOD,
} from "../mail/types"
export const sendEmailConfirmation = inngest.createFunction(
  { id: "send-email-confirmation" },
  { event: "email/send-one" },
  async ({ event }) => {
    return sendPaymentConfirmationMail({
      ticketId: event.data.ticketId,
      force: event.data.force,
    })
  }
)

export const waitForConfirmationAndCreateTicket = inngest.createFunction(
  {
    id: "wait-for-confirmation-and-create-ticket",
    retries: 5,
  },
  { event: "solana/wait-for-confirmation-and-create-ticket" },
  async ({ event, step }) => {
    const { purchaseId, txId } = event.data
    const result = await step.run("fulfill-purchase", async () => {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
      })
      if (!purchase) throw new NonRetriableError("Purchase not found")
      return fulfillSolanaPurchase(purchase, txId)
    })
    await step.sendEvent("send-confirmation", {
      name: "email/send-one",
      data: { ticketId: result.ticketId },
    })
  }
)

export const resendEmailConfirmations = inngest.createFunction(
  { id: "resend-email-confirmations" },
  { event: "email/send-multiple" },
  async ({ event, step }) => {
    // It makes sense to use [steps](https://www.inngest.com/docs/guides/multi-step-functions) here, so that below code
    // doesn't get called multiple times
    // but >1000 tickets can generate a payload that exceeds 256kB limit of a free inngest plan.
    const ticketIds: string[] | string = event.data.ticketIds
    const resendAll = event.data.resendAll

    const ticketsQuery = {
      where: {
        eventId: event.data.eventId,
      },
      select: {
        id: true,
        user: { select: { name: true, email: true } },
        qrCode: true,
        selectedMerchOptions: true,
        eventId: true,
        emailSent: true,
        emailSentDateTime: true,
      },
      orderBy: [{ purchaseDateTime: Prisma.SortOrder.asc }],
    }
    if (!resendAll) {
      // theoretically ticketIds might be a string
      // might need to choose a convention to restict incoming type
      ticketsQuery["where"]["id"] = {
        in: Array.isArray(ticketIds) ? ticketIds : [ticketIds],
      }
    }

    const tickets = (await prisma.ticket.findMany(ticketsQuery)).map(
      (ticket) => ticket.id
    )
    const nBatches = Math.ceil(tickets.length / EMAIL_CONFIRMATION_BATCH_SIZE)
    if (tickets.length === 0) return "No tickets available for resend"

    console.log(
      `Scheduling emails for ${tickets.length} tickets in ${nBatches} batches`
    )

    let start = 0
    for (let i = 1; i <= nBatches; i++) {
      const end = i * EMAIL_CONFIRMATION_BATCH_SIZE
      const batch = tickets.slice(start, end)
      start = end
      if (batch.length === 0) {
        break
      }
      try {
        const batchPayloadSize =
          new TextEncoder().encode(JSON.stringify(batch)).length / 1024
        if (batchPayloadSize > 256) {
          throw new Error(
            `Batch size exceeds 256KB limit: ${batchPayloadSize}KB`
          )
        }
        await step.sendEvent(
          `resend-email-confirmations-${event.data.eventId}-batch-${i}`,
          {
            // `sendPaymentConfirmationMail` is idempotent, preventing messages for the same ticket sent more often
            // then configured by `EMAIL_CONFIRMATION_RESEND_INTERVAL` env.
            name: "email/resend-confirmations-batch",
            data: { ticketIds: batch, batchNumber: i },
          }
        )
      } catch (err) {
        throw new NonRetriableError(`Failed to schedule batch: ${err}`)
      }
    }
  }
)

export const resendEmailConfirmationsBatch = inngest.createFunction(
  {
    id: "resend-email-confirmations-batch",
    // https://www.inngest.com/docs/guides/throttling
    throttle: {
      limit: EMAIL_CONFIRMATION_THROTTLE_LIMIT,
      period: EMAIL_CONFIRMATION_THROTTLE_PERIOD,
    },
  },
  { event: "email/resend-confirmations-batch" },
  async ({ event }) => {
    const ticketIds: string[] = event.data.ticketIds
    const batchNumber = event.data.batchNumber
    console.log(`Processing batch ${batchNumber}`)
    const sendEmails = ticketIds.map((ticketId) => {
      return sendPaymentConfirmationMail({
        ticketId,
        force: true,
      })
    })
    return Promise.allSettled(sendEmails).then((results) => {
      const failed = results.some(
        (result) =>
          result.status === "rejected" && result.reason?.responseCode === 429
      )
      if (failed) {
        throw new RetryAfterError("Rate limited", 60 * 10 * 1000)
      }
      const failures = results.filter((r) => r.status === "rejected")
      if (failures.length > 0) {
        throw new Error(`Batch rejected. ${failures.map((f) => f.reason)}`)
      }
      return results
    })
  }
)

const ORDER_RETRY_TIMEOUT = 2000
const ORDER_RETRY_ATTEMPTS = 60

export const waitForOrderAndCompletePurchaseFn: ({
  event,
  step,
}) => void = async ({ event }) => {
  const existingPurchaseByKadoOrderId = await getPurchaseByKadoOrderId(
    event.data.orderId
  )
  if (
    existingPurchaseByKadoOrderId &&
    existingPurchaseByKadoOrderId.status === $Enums.PurchaseStatus.COMPLETED
  ) {
    throw new NonRetriableError("Purchase with this order ID already exists")
  }
  const existingPurchaseByNonce = await getPurchaseByNonce(event.data.nonce)
  if (
    existingPurchaseByNonce?.kadoOrderId &&
    existingPurchaseByNonce.kadoOrderId !== event.data.orderId
  ) {
    throw new NonRetriableError(
      `Cannot overwrite an existing order ID. Nonce: ${event.data.nonce}, new order ID: ${event.data.orderId}`
    )
  }
  for (let i = 1; i <= ORDER_RETRY_ATTEMPTS; i += 1) {
    try {
      const res = await getOrderStatus({ orderId: event.data.orderId })
      console.log(
        `Order<${event.data.orderId}> status: ${res.data.paymentStatus}`
      )
      // Update purchase Tx only after we receive a valid response from order status endpoint
      if (i === 1)
        await updatePurchaseKadoOrderId(event.data.nonce, event.data.orderId)
      if (
        res.data.paymentStatus === "failed" ||
        res.data.transferStatus === "failed"
      ) {
        return await completePurchase(event.data, res)
      }
      if (
        !res.success ||
        res.data.paymentStatus !== "success" ||
        res.data.transferStatus !== "settled"
      ) {
        await new Promise((res) => setTimeout(res, ORDER_RETRY_TIMEOUT))
      } else {
        return await completePurchase(event.data, res)
      }
    } catch (_error) {
      throw new NonRetriableError(
        `Invalid or malformed order ID: ${event.data.orderId}`
      )
    }
  }
  throw new NonRetriableError(
    `Order failed to complete within reasonable time for order Id: ${event.data.orderId}`
  )
}

export const waitForOrderAndCompletePurchase = inngest.createFunction(
  { id: "wait-for-kado-order-and-complete-purchase" },
  { event: "kado/wait-for-order-and-complete-purchase" },
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  waitForOrderAndCompletePurchaseFn
)
