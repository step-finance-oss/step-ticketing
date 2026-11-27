import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js"
import prisma, { $Enums, Purchase } from "lib/prisma"
import { createTicket } from "lib/ticket"
import {
  CompletePurchaseParams,
  CompletePurchaseResponse,
  InitiatePurchaseResponse,
  MerchOptions,
} from "./types"
import { applyPromoCode, getPromoCode } from "lib/promocode"
import { validateIncomingSignedTransactionById } from "lib/solana-utils"
import { getCurrentPrice, isAbleToPay } from "lib/utils"
import { PurchaseData } from "lib/purchase/types"
import { inngest } from "../inngest/client"
import { TransactionFetchError } from "lib/error"

const USDC_UNIT_SIZE = 1e6

const connection = new Connection(
  process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || clusterApiUrl("devnet"),
  "confirmed"
)
const USDC_MINT_ADDRESS = process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS
const RECIPIENT_PUBLIC_KEY = process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY

export const initiatePurchase: (
  publicKey: string,
  eventId: string,
  priceTierId: string,
  priceOptionId: string,
  name: string,
  email: string,
  merch?: MerchOptions,
  promocode?: string,
  source?: PurchaseData["source"]
) => Promise<InitiatePurchaseResponse> = async (
  publicKey,
  eventId,
  priceTierId,
  priceOptionId,
  name,
  email,
  merch,
  promocode,
  source = "solana-wallet"
) => {
  const transaction = new Transaction()

  if (!USDC_MINT_ADDRESS) {
    throw new Error("USDC_MINT_ADDRESS is required")
  }

  if (!RECIPIENT_PUBLIC_KEY) {
    throw new Error("RECIPIENT_PUBLIC_KEY is required")
  }

  if (
    !eventId ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    throw new Error("Missing purchase details")
  }

  let totalAmount = await getPaymentAmount(priceTierId, priceOptionId, eventId)
  const amountInUSD = totalAmount / USDC_UNIT_SIZE

  if (promocode) {
    if (typeof promocode !== "string") throw new Error("Invalid promo code")
    const pc = await getPromoCode(promocode, priceTierId)
    totalAmount = applyPromoCode(amountInUSD, pc, USDC_UNIT_SIZE)
  }

  if (!Number.isSafeInteger(totalAmount) || totalAmount < 0) {
    throw new Error("Invalid purchase amount")
  }

  const publicKeyP = new PublicKey(publicKey)
  const recipientPublicKey = new PublicKey(RECIPIENT_PUBLIC_KEY)
  const usdcMintAddress = new PublicKey(USDC_MINT_ADDRESS)

  const senderTokenAddress = await getAssociatedTokenAddress(
    usdcMintAddress,
    publicKeyP
  )

  const recipientTokenAddress = await getAssociatedTokenAddress(
    usdcMintAddress,
    recipientPublicKey
  )

  const transfer = createTransferInstruction(
    senderTokenAddress,
    recipientTokenAddress,
    publicKeyP,
    totalAmount,
    [],
    TOKEN_PROGRAM_ID
  )
  // A Solana Pay reference distinguishes even identical quotes in the same block.
  transfer.keys.push({
    pubkey: Keypair.generate().publicKey,
    isSigner: false,
    isWritable: false,
  })
  transaction.add(transfer)

  transaction.feePayer = publicKeyP
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash

  const nonce = crypto.randomUUID()
  const serializedTx = serializeTransaction(transaction)
  const purchaseData: PurchaseData = {
    source,
    name: name,
    email: email,
    merchOptions: merch,
    priceWithPromocode: promocode ? totalAmount : undefined,
    totalPrice: totalAmount,
    promocode: promocode ?? undefined,
    eventId: eventId,
    priceTierId: priceTierId,
    priceOptionId: priceOptionId,
  }

  await prisma.purchase.create({
    data: {
      tx: serializedTx,
      nonce,
      amount: BigInt(totalAmount),
      data: purchaseData,
    },
  })
  return {
    serializedTx,
    nonce,
    priceWithPromocode: promocode ? totalAmount / USDC_UNIT_SIZE : undefined,
  }
}

function serializeTransaction(transaction: Transaction): string {
  const serialized = transaction.serialize({ requireAllSignatures: false })
  return serialized.toString("base64")
}

export async function fulfillSolanaPurchase(purchase: Purchase, txId: string) {
  if (!purchase.tx || purchase.kadoOrderId)
    throw new Error("Invalid payment method.")
  const order = purchase.data as PurchaseData | null
  if (!order?.eventId || !order.priceTierId || !order.email || !order.name) {
    throw new Error("Purchase data not found.")
  }

  const existing = await prisma.ticket.findUnique({
    where: { purchaseId: purchase.id },
  })
  if (existing) {
    if (existing.txId !== txId)
      throw new Error("This purchase already has a ticket")
    return { txId, ticketId: existing.id, qrCode: existing.qrCode }
  }
  if (purchase.status !== "PENDING" && purchase.status !== "IDLE") {
    throw new Error("Purchase is not pending.")
  }

  if (
    !order.source &&
    (await prisma.purchase.findFirst({
      where: { tx: purchase.tx, NOT: { id: purchase.id } },
      select: { id: true },
    }))
  ) {
    throw new Error("Cannot distinguish duplicate historical purchase quotes.")
  }

  const payerWalletAddress = await validateIncomingSignedTransactionById(
    connection,
    txId,
    purchase.amount,
    purchase.tx
  )

  return prisma.$transaction(
    async (db) => {
      await db.purchase.update({
        where: { id: purchase.id, status: { in: ["PENDING", "IDLE"] } },
        data: { status: "COMPLETED", txId },
      })
      const ticket = await createTicket(
        {
          name: order.name,
          email: order.email,
          eventId: order.eventId,
          priceTierId: order.priceTierId,
          priceOptionId: order.priceOptionId || null,
          txId,
          promocode: order.promocode,
          purchasePrice: Number(purchase.amount) / USDC_UNIT_SIZE,
          selectedMerchOptions: order.merchOptions ?? {},
          source: order.source ?? null,
          purchaseId: purchase.id,
          payerWalletAddress,
        },
        db
      )
      return { txId, ticketId: ticket.id, qrCode: ticket.qrCode }
    },
    { timeout: 10000 }
  )
}

export async function completePurchase({
  nonce,
  txId,
}: CompletePurchaseParams): Promise<CompletePurchaseResponse> {
  if (typeof nonce !== "string" || !nonce) throw new Error("Invalid nonce.")
  if (typeof txId !== "string" || !txId)
    throw new Error("No transaction ID provided.")
  const purchase = await prisma.purchase.findUnique({ where: { nonce } })
  if (!purchase) throw new Error("Invalid nonce.")

  let result
  try {
    result = await fulfillSolanaPurchase(purchase, txId)
  } catch (error) {
    if (error instanceof TransactionFetchError) {
      await inngest.send({
        name: "solana/wait-for-confirmation-and-create-ticket",
        data: { purchaseId: purchase.id, txId },
      })
      throw new Error(
        "Could not confirm your transaction due to issues with Solana RPC. If transaction was successful you should receive your tickets via email."
      )
    }
    throw error
  }
  await inngest.send({
    name: "email/send-one",
    data: { ticketId: result.ticketId },
  })
  return result
}

export const getPurchaseByNonce: (
  nonce: string
) => Promise<Purchase | null> = async (nonce) => {
  return prisma.purchase.findFirst({ where: { nonce: nonce } })
}

export const getPurchaseByKadoOrderId: (
  orderId: string
) => Promise<Purchase | null> = async (orderId) => {
  return await prisma.purchase.findFirst({ where: { kadoOrderId: orderId } })
}

export const updatePurchaseKadoOrderId: (
  nonce: string,
  orderId: string
) => Promise<Purchase | null> = async (nonce, orderId) => {
  return prisma.purchase.update({
    where: {
      nonce,
      tx: "",
      status: { in: ["PENDING", "IDLE"] },
      OR: [{ kadoOrderId: null }, { kadoOrderId: orderId }],
    },
    data: { kadoOrderId: orderId },
  })
}

export const updatePurchaseTx: (
  nonce: string,
  tx: string
) => Promise<Purchase | null> = async (nonce, tx) => {
  return prisma.purchase.update({ where: { nonce: nonce }, data: { tx: tx } })
}

export const updatePurchaseStatus: (
  nonce: string,
  status: $Enums.PurchaseStatus
) => Promise<Purchase | null> = async (nonce, status) => {
  return prisma.purchase.update({
    where: { nonce, status: { in: ["PENDING", "IDLE"] } },
    data: {
      status,
    },
  })
}

export const getPurchases: (params?: {
  query?: string
}) => Promise<Purchase[]> = async (params) => {
  const res = await prisma.purchase.findMany({
    where: params?.query
      ? {
          OR: [
            {
              kadoOrderId: { contains: params?.query },
            },
            {
              status: {
                equals: params?.query
                  ? $Enums.PurchaseStatus[params?.query]
                  : undefined,
              },
            },
            { tx: { contains: params?.query } },
            { nonce: { contains: params?.query } },
            { ticket: { id: { contains: params?.query } } },
            { data: { path: ["name"], string_contains: params?.query } },
            { data: { path: ["email"], string_contains: params?.query } },
            { data: { path: ["eventId"], string_contains: params?.query } },
            { data: { path: ["priceTierId"], string_contains: params?.query } },
            {
              data: { path: ["priceOptionId"], string_contains: params?.query },
            },
          ],
        }
      : undefined,
    include: { ticket: true },
  })

  return res
}

export async function getPaymentAmount(
  priceTierId: string,
  priceOptionId?: string,
  eventId?: string
) {
  const tier = await prisma.priceTier.findUnique({
    where: { id: priceTierId },
    include: {
      priceOptions: true,
      event: {
        select: {
          published: true,
          date: true,
          ticketsAvailabilityDuration: true,
        },
      },
      _count: { select: { tickets: true } },
    },
  })
  if (!tier || (eventId !== undefined && tier.eventId !== eventId)) {
    throw new Error("Invalid price tier")
  }
  if (
    !tier.event.published ||
    !isAbleToPay(tier.event.date, tier.event.ticketsAvailabilityDuration) ||
    (tier.limit > 0 && tier._count.tickets >= tier.limit)
  ) {
    throw new Error("Ticket sales unavailable")
  }
  const current = getCurrentPrice({
    price: tier.price.toNumber(),
    priceOptions: tier.priceOptions.map((option) => ({
      ...option,
      price: option.price.toNumber(),
    })),
  })
  if (
    !current.isAvailable ||
    current.priceOptionId !== (priceOptionId || undefined)
  ) {
    throw new Error("Invalid price option")
  }
  return Math.round(current.price * USDC_UNIT_SIZE)
}
