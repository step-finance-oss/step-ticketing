import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionResponse,
} from "@solana/web3.js"
import { Decimal } from "@prisma/client/runtime/library"
import { Inngest } from "inngest"
import prisma from "lib/__mocks__/prisma"
import { completePurchase, initiatePurchase } from "lib/purchase/server"
import { validateIncomingSignedTransactionById } from "../solana-utils"
import { priceTierFactory } from "../factories/price-tier"
import { promoCodeFactory } from "../factories/promo-code"
import { ticketFactory } from "../factories/ticket"
import { Purchase } from "../prisma"

vi.mock("lib/prisma")

const payer = Keypair.generate().publicKey.toBase58()
const blockhash = PublicKey.unique().toBase58()
const tier = priceTierFactory("General", 10)
const option = {
  id: "current",
  priceTierId: tier.id,
  price: new Decimal(100),
  validUntil: new Date("2100-01-01"),
  label: "Current",
}
const txId = "test-signature"
const availableTier = {
  ...tier,
  _count: { tickets: 0 },
  event: {
    published: true,
    date: new Date("2100-01-01"),
    ticketsAvailabilityDuration: 0,
  },
  priceOptions: [option],
}

beforeEach(() => {
  vi.spyOn(Connection.prototype, "getLatestBlockhash").mockResolvedValue({
    blockhash,
    lastValidBlockHeight: 10,
  })
  prisma.priceTier.findUnique.mockResolvedValue(availableTier)
})
afterEach(() => vi.restoreAllMocks())

function quote(
  optionId = option.id,
  eventId = tier.eventId,
  promocode?: string
) {
  return initiatePurchase(
    payer,
    eventId,
    tier.id,
    optionId,
    "Buyer",
    "buyer@example.com",
    { shirt: { size: "M" } },
    promocode
  )
}

async function createOrder(): Promise<Purchase> {
  const { serializedTx, nonce } = await quote()
  const orderData = prisma.purchase.create.mock.calls.at(-1)![0].data.data
  return {
    id: "purchase",
    nonce,
    tx: serializedTx,
    txId: null,
    data: orderData as Purchase["data"],
    amount: BigInt(100e6),
    kadoOrderId: null,
    status: "PENDING",
    updatedAt: null,
  }
}

function confirmedTransfer(quote: Transaction, amount: bigint) {
  const message = quote.compileMessage()
  const destination = quote.instructions.find((ix) => ix.keys.length >= 3)!
    .keys[1].pubkey
  const accountIndex = message.accountKeys.findIndex((key) =>
    key.equals(destination)
  )
  const balance = (amount: bigint) => ({
    accountIndex,
    mint: process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS!,
    owner: process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY!,
    uiTokenAmount: { amount: amount.toString(), decimals: 6, uiAmount: null },
  })
  // RPC reports base units as decimal strings even when the balance exceeds 2^53.
  const before = BigInt("9007199254740993")
  const tx: TransactionResponse = {
    slot: 1,
    transaction: { message, signatures: [txId] },
    meta: {
      err: null,
      fee: 5,
      preBalances: [],
      postBalances: [],
      preTokenBalances: [balance(before)],
      postTokenBalances: [balance(before + amount)],
    },
  }
  vi.spyOn(Connection.prototype, "getTransaction").mockResolvedValue(tx)
  return tx
}

describe("Quoting a purchase", () => {
  it("rejects a missing price tier", async () => {
    prisma.priceTier.findUnique.mockResolvedValue(null)
    await expect(quote()).rejects.toThrow("Invalid price tier")
  })

  it("rejects a price tier belonging to another event", async () => {
    await expect(quote(option.id, "another-event")).rejects.toThrow(
      "Invalid price tier"
    )
  })

  it.each(["", "other-tier-option", "expired-option"])(
    "rejects an unavailable option %j",
    async (optionId) => {
      const expired = {
        ...option,
        id: "expired-option",
        validUntil: new Date(0),
      }
      prisma.priceTier.findUnique.mockResolvedValue(
        Object.assign({}, availableTier, { priceOptions: [expired, option] })
      )
      await expect(quote(optionId)).rejects.toThrow("Invalid price option")
    }
  )

  it.each([
    ["unpublished", { event: { ...availableTier.event, published: false } }],
    ["sales closed", { event: { ...availableTier.event, date: new Date(0) } }],
    ["sold out", { _count: { tickets: tier.limit } }],
  ] as const)(
    "rejects a quote when the event is %s",
    async (_reason, changes) => {
      prisma.priceTier.findUnique.mockResolvedValue(
        Object.assign({}, availableTier, changes)
      )
      await expect(quote()).rejects.toThrow("Ticket sales unavailable")
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    }
  )

  it("applies the current price option when the tier has unlimited inventory", async () => {
    prisma.priceTier.findUnique.mockResolvedValue(
      Object.assign({}, availableTier, { limit: 0, _count: { tickets: 20 } })
    )
    await quote()
    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: BigInt(100e6) }),
    })
  })

  it("quotes the base tier when it has no price options", async () => {
    prisma.priceTier.findUnique.mockResolvedValue(
      Object.assign({}, availableTier, { priceOptions: [] })
    )
    await quote("")
    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: BigInt(tier.price.toNumber() * 1e6),
      }),
    })
  })

  it("persists discounted base units and buyer details", async () => {
    prisma.promoCode.findFirst.mockResolvedValue(promoCodeFactory(10, null))
    const result = await quote(option.id, tier.eventId, "PROMO")
    expect(result.priceWithPromocode).toBe(90)
    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: {
        tx: result.serializedTx,
        nonce: result.nonce,
        amount: BigInt(90e6),
        data: {
          name: "Buyer",
          email: "buyer@example.com",
          source: "solana-wallet",
          merchOptions: { shirt: { size: "M" } },
          priceWithPromocode: 90e6,
          totalPrice: 90e6,
          promocode: "PROMO",
          eventId: tier.eventId,
          priceTierId: tier.id,
          priceOptionId: option.id,
        },
      },
    })
  })
})

describe("Validating the quoted transfer", () => {
  const connection = new Connection("http://localhost:8899")

  it("matches the order reference when a wallet adds fees or refreshes the blockhash", async () => {
    const order = await createOrder()
    const other = await createOrder()
    const signed = Transaction.from(Buffer.from(order.tx, "base64"))
    signed.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 10000 })
    )
    signed.recentBlockhash = PublicKey.unique().toBase58()
    confirmedTransfer(signed, order.amount)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        order.tx
      )
    ).resolves.toBe(payer)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        other.amount,
        other.tx
      )
    ).rejects.toThrow("does not match the purchase")
  })

  it.each([
    [
      "amount in base units",
      {
        uiTokenAmount: {
          amount: "9007199354740992",
          decimals: 6,
          uiAmount: null,
        },
      },
    ],
    ["token mint", { mint: "another-mint" }],
    ["recipient", { owner: "another-owner" }],
    ["destination account", { accountIndex: 999 }],
  ] as const)("rejects a different %s", async (_condition, changes) => {
    const order = await createOrder()
    const tx = confirmedTransfer(
      Transaction.from(Buffer.from(order.tx, "base64")),
      order.amount
    )
    Object.assign(tx.meta!.postTokenBalances![0], changes)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        order.tx
      )
    ).rejects.toThrow("Transferred amount does not match")
  })

  it("rejects a failed transaction", async () => {
    const order = await createOrder()
    const tx = confirmedTransfer(
      Transaction.from(Buffer.from(order.tx, "base64")),
      order.amount
    )
    tx.meta!.err = { InstructionError: [0, "InvalidArgument"] }
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        order.tx
      )
    ).rejects.toThrow("failed to execute")
  })

  it("requests confirmed commitment and retries unavailable transactions", async () => {
    const order = await createOrder()
    const fetchTx = vi
      .spyOn(Connection.prototype, "getTransaction")
      .mockResolvedValue(null)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        order.tx
      )
    ).rejects.toThrow("Can not fetch transaction")
    expect(fetchTx).toHaveBeenCalledWith(txId, { commitment: "confirmed" })
  })

  it("accepts historical transfers only with their original message", async () => {
    const order = await createOrder()
    const legacy = Transaction.from(Buffer.from(order.tx, "base64"))
    legacy.instructions[0].keys.pop()
    const stored = legacy
      .serialize({ requireAllSignatures: false })
      .toString("base64")
    confirmedTransfer(legacy, order.amount)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        stored
      )
    ).resolves.toBe(payer)
    legacy.recentBlockhash = PublicKey.unique().toBase58()
    confirmedTransfer(legacy, order.amount)
    await expect(
      validateIncomingSignedTransactionById(
        connection,
        txId,
        order.amount,
        stored
      )
    ).rejects.toThrow("does not match the purchase")
  })
})

describe("Completing purchases", () => {
  it("rejects unknown orders and mismatched existing tickets", async () => {
    await expect(completePurchase({ nonce: "missing", txId })).rejects.toThrow(
      "Invalid nonce"
    )
    const order = await createOrder()
    prisma.purchase.findUnique.mockResolvedValue(order)
    prisma.ticket.findUnique.mockResolvedValue(
      ticketFactory(100, 100, "solana-wallet", "")
    )
    await expect(
      completePurchase({ nonce: order.nonce, txId })
    ).rejects.toThrow("already has a ticket")
  })

  it("issues the ticket from the stored order inside the purchase transaction", async () => {
    const order = await createOrder()
    const signed = Transaction.from(Buffer.from(order.tx, "base64"))
    confirmedTransfer(signed, order.amount)
    const send = vi
      .spyOn(Inngest.prototype, "send")
      .mockResolvedValue({ ids: ["sent"] })
    prisma.purchase.findUnique.mockResolvedValue(order)
    const ticket = ticketFactory(100, 100, "solana-wallet", "")!
    prisma.ticket.create.mockResolvedValue(ticket)
    prisma.$transaction.mockImplementation(async (run) => run(prisma))
    const completion = {
      nonce: order.nonce,
      txId,
      priceWithPromocode: 0,
      email: "other@example.com",
      priceTierId: "other",
    }
    const result = await completePurchase(completion)
    expect(result.ticketId).toBe(ticket.id)
    expect(prisma.purchase.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "COMPLETED", txId } })
    )
    expect(prisma.ticket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user: {
          connectOrCreate: {
            where: { email: "buyer@example.com" },
            create: { name: "Buyer", email: "buyer@example.com" },
          },
        },
        priceTier: { connect: { id: tier.id } },
        purchasePrice: 100,
        payerWalletAddress: payer,
        selectedMerchOptions: { shirt: { size: "M" } },
      }),
    })
    expect(send).toHaveBeenCalledWith({
      name: "email/send-one",
      data: { ticketId: ticket.id },
    })
  })

  it("queues only the order and signature when confirmation is delayed", async () => {
    const order = await createOrder()
    prisma.purchase.findUnique.mockResolvedValue(order)
    vi.spyOn(Connection.prototype, "getTransaction").mockResolvedValue(null)
    const send = vi
      .spyOn(Inngest.prototype, "send")
      .mockResolvedValue({ ids: ["queued"] })
    await expect(
      completePurchase({ nonce: order.nonce, txId })
    ).rejects.toThrow("Could not confirm")
    expect(send).toHaveBeenCalledWith({
      name: "solana/wait-for-confirmation-and-create-ticket",
      data: { purchaseId: order.id, txId },
    })
    expect(prisma.purchase.update).not.toHaveBeenCalled()
    expect(prisma.ticket.create).not.toHaveBeenCalled()
  })
})
