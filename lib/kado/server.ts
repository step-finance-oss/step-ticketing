import { applyPromoCode, getPromoCode } from "../promocode"
import {
  CompletePurchaseParams,
  CompletePurchaseResponse,
  GetOrderStatusResponse,
  InitiatePurchaseParams,
  InitiatePurchaseResponse,
} from "./types"
import prisma, { $Enums } from "lib/prisma"
import { v4 as uuid4 } from "uuid"
import { createTicket } from "../ticket"
import { updatePurchaseStatus } from "../purchase/server"
import { getCurrentPrice } from "lib/utils"
import { getPriceTierExtended } from "lib/price-tier"
import { MerchOptions, PurchaseData } from "lib/purchase/types"
import { inngest } from "../inngest/client"

const RECIPIENT_PUBLIC_KEY = process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY

export const initiatePurchase: (
  params: InitiatePurchaseParams
) => Promise<InitiatePurchaseResponse> = async ({
  values,
  priceTierId,
  promocode,
}) => {
  if (!RECIPIENT_PUBLIC_KEY) {
    throw new Error("RECIPIENT_PUBLIC_KEY is required")
  }

  const priceTier = await getPriceTierExtended(priceTierId)

  if (!priceTier) {
    throw new Error("Price tier does not exist")
  }

  const currentPrice = getCurrentPrice(priceTier)
  console.log("currentPrice", currentPrice)
  if (!currentPrice.isAvailable) {
    throw new Error("No price available")
  }

  let totalAmount: number = currentPrice.price

  if (promocode) {
    if (typeof promocode !== "string") throw new Error("Invalid promo code")
    const pc = await getPromoCode(promocode, priceTierId)
    totalAmount = applyPromoCode(currentPrice.price, pc, undefined, 2)
  }

  const purchaseData: PurchaseData = {
    name: values.name ?? "",
    email: values.email ?? "",
    merchOptions: values.merch,
    priceWithPromocode: promocode ? totalAmount : undefined,
    totalPrice: totalAmount,
    promocode: promocode ?? undefined,
    eventId: priceTier.eventId,
    priceTierId: priceTier.id,
    priceOptionId: currentPrice.priceOptionId,
  }

  const purchase = await prisma.purchase.create({
    data: {
      tx: "",
      nonce: uuid4(),
      data: purchaseData,
    },
  })

  return {
    nonce: purchase.nonce,
    priceWithPromocode: promocode ? totalAmount : undefined,
    totalPrice: totalAmount,
  }
}

export const completePurchase: (
  data: CompletePurchaseParams,
  orderStatusResponse: GetOrderStatusResponse | undefined
) => Promise<CompletePurchaseResponse> = async (data, orderStatusResponse) => {
  const { nonce, orderId } = data

  if (!orderStatusResponse || !orderStatusResponse.data) {
    throw new Error("Order not found")
  }

  const purchase = await prisma.purchase.findFirst({
    where: { nonce },
  })

  if (!purchase) {
    throw new Error("Purchase not found")
  }

  if (purchase.kadoOrderId !== orderId) {
    throw new Error("Nonce or order ID are invalid")
  }

  if (
    !orderStatusResponse.success ||
    orderStatusResponse.data.paymentStatus !== "success" ||
    orderStatusResponse.data.transferStatus !== "settled"
  ) {
    if (
      orderStatusResponse.data.paymentStatus === "failed" ||
      orderStatusResponse.data.transferStatus === "failed"
    ) {
      await updatePurchaseStatus(nonce, $Enums.PurchaseStatus.CANCELLED)
    }

    throw new Error("Payment not completed")
  }

  const ticket = await prisma.ticket.findFirst({
    where: { kadoPaymentId: orderId },
    include: { user: true },
  })

  if (ticket) {
    if (
      ticket.nonce !== purchase.nonce ||
      ticket.kadoPaymentId !== purchase.kadoOrderId
    ) {
      throw new Error("Nonce or order ID are invalid")
    }

    return {
      orderId,
      nonce,
      eventId: ticket.eventId,
      priceTierId: ticket.priceTierId,
      priceOptionId: ticket.priceOptionId ?? undefined,
      name: ticket.name ?? "",
      email: ticket.user.email,
      merchOptions: ticket.selectedMerchOptions as PurchaseData["merchOptions"],
      priceWithPromocode:
        ticket.promoCodeId && ticket.purchasePrice
          ? Number(ticket.purchasePrice)
          : undefined,
      totalPrice: ticket.purchasePrice
        ? Number(ticket.purchasePrice)
        : undefined,
      source: ticket.source ?? undefined,
    }
  }

  const purchaseData = (purchase.data || undefined) as PurchaseData | undefined

  if (!purchaseData) {
    throw new Error("Purchase data not found")
  }

  if (
    orderStatusResponse.data.sendTo !==
    process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY
  ) {
    throw new Error("Recipient wallet address does not match")
  }

  if (
    !Number.isFinite(purchaseData.totalPrice) ||
    !Number.isFinite(orderStatusResponse.data.recvAmount.amount) ||
    !orderStatusResponse.data.txHash ||
    orderStatusResponse.data.recvAmount.unit !== "USDC" ||
    // The final value may differ slightly from the required one, let's check that the difference is not too big
    orderStatusResponse.data.recvAmount.amount /
      (purchaseData.totalPrice ?? 0) <
      0.97
  ) {
    throw new Error("Purchase amount does not match")
  }

  const ticketRes = await prisma.$transaction(async (db) => {
    await db.purchase.update({
      where: {
        id: purchase.id,
        kadoOrderId: orderId,
        status: { in: ["PENDING", "IDLE"] },
      },
      data: { status: "COMPLETED", txId: orderStatusResponse.data.txHash },
    })
    return createTicket(
      {
        name: purchaseData.name,
        email: purchaseData.email,
        eventId: purchaseData.eventId,
        priceTierId: purchaseData.priceTierId,
        priceOptionId: purchaseData.priceOptionId ?? null,
        txId: orderStatusResponse.data.txHash,
        promocode: purchaseData.promocode,
        purchasePrice:
          purchaseData.priceWithPromocode ?? purchaseData.totalPrice,
        selectedMerchOptions: purchaseData.merchOptions as MerchOptions,
        source: "kado",
        nonce,
        purchaseId: purchase.id,
        kadoPaymentId: orderId,
        payerWalletAddress: null,
      },
      db
    )
  })

  await inngest.send({
    name: "email/send-one",
    data: { ticketId: ticketRes.id },
  })

  return {
    orderId,
    nonce,
    eventId: ticketRes.eventId,
    priceTierId: ticketRes.priceTierId,
    priceOptionId: ticketRes.priceOptionId ?? undefined,
    name: ticketRes.name ?? "",
    email: purchaseData.email,
    merchOptions:
      ticketRes.selectedMerchOptions as PurchaseData["merchOptions"],
    priceWithPromocode:
      ticketRes.promoCodeId && ticketRes.purchasePrice
        ? Number(ticketRes.purchasePrice)
        : undefined,
    totalPrice: ticketRes.purchasePrice
      ? Number(ticketRes.purchasePrice)
      : undefined,
    source: ticketRes.source ?? undefined,
  }
}
