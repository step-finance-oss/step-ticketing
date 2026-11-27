import { expect, vi, describe, it } from "vitest"
import { purchaseFactory } from "../factories/purchase"
import prisma, { $Enums } from "lib/__mocks__/prisma"
import { completePurchase, initiatePurchase } from "lib/kado/server"
import { kadoOrderStatusResponseFactory } from "../factories/kado"
import { ticketFactory } from "../factories/ticket"
import { priceTierFactory } from "../factories/price-tier"
import { promoCodeFactory } from "../factories/promo-code"
import { Inngest } from "inngest"

vi.mock("lib/prisma")

describe("Completing purchase", () => {
  it("Should fail if the purchase doesn't exist", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(null)
    await expect(async () => {
      await completePurchase(
        { orderId: "1234567890", nonce: "nonce" },
        kadoOrderStatusResponseFactory(true, "settled", "success", 10)
      )
    }).rejects.toThrowError("Purchase not found")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should fail if order status response is invalid", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    await expect(async () => {
      await completePurchase(
        { orderId: "1234567890", nonce: "nonce" },
        undefined
      )
    }).rejects.toThrowError("Order not found")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should fail if order is not yet completed", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        10,
        "tx",
        "nonce",
        "kadoOrderId",
        $Enums.PurchaseStatus.PENDING
      )
    )
    await expect(async () => {
      await completePurchase(
        { orderId: "kadoOrderId", nonce: "nonce" },
        kadoOrderStatusResponseFactory(false, "failed", "failed", 10)
      )
    }).rejects.toThrowError("Payment not completed")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should fail if Kado order id doesn't match purchase value in DB", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        10,
        "tx",
        "nonce",
        "kadoOrderId",
        $Enums.PurchaseStatus.PENDING
      )
    )
    await expect(async () => {
      await completePurchase(
        { orderId: "1234567890", nonce: "nonce" },
        kadoOrderStatusResponseFactory(true, "settled", "success", 10)
      )
    }).rejects.toThrowError("Nonce or order ID are invalid")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should return ticket from DB if it exists already", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        10,
        "tx",
        "nonce",
        "1234567890",
        $Enums.PurchaseStatus.PENDING
      )
    )
    const ticketResponse = ticketFactory(10, 10, "kado", "1234567890")
    prisma.ticket.findFirst.mockResolvedValue(ticketResponse)
    const res = await completePurchase(
      { orderId: "1234567890", nonce: "nonce" },
      kadoOrderStatusResponseFactory(true, "settled", "success", 10)
    )
    expect(res).toEqual({
      email: ticketResponse?.user.email,
      eventId: ticketResponse?.eventId,
      merchOptions: ticketResponse?.selectedMerchOptions,
      name: "",
      nonce: ticketResponse?.nonce,
      orderId: ticketResponse?.kadoPaymentId,
      priceOptionId: ticketResponse?.priceOptionId,
      priceTierId: ticketResponse?.priceTierId,
      priceWithPromocode: Number(ticketResponse?.purchasePrice),
      source: ticketResponse?.source,
      totalPrice: Number(ticketResponse?.purchasePrice),
    })
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should fail if kado order recipient address doesn't match env setting", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        10,
        "tx",
        "nonce",
        "kadoOrderId",
        $Enums.PurchaseStatus.PENDING
      )
    )
    const kadoStatusResponse = kadoOrderStatusResponseFactory(
      true,
      "settled",
      "success",
      10
    )
    await expect(async () => {
      await completePurchase(
        { orderId: "kadoOrderId", nonce: "nonce" },
        kadoStatusResponse
      )
    }).rejects.toThrowError("Recipient wallet address does not match")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should fail if order amount doesn't match purchase DB value", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        12,
        "tx",
        "nonce",
        "kadoOrderId",
        $Enums.PurchaseStatus.PENDING,
        { totalPrice: 12 }
      )
    )
    const kadoStatusResponse = kadoOrderStatusResponseFactory(
      true,
      "settled",
      "success",
      10
    )
    vi.stubEnv(
      "NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY",
      kadoStatusResponse.data.sendTo
    )
    await expect(async () => {
      await completePurchase(
        { orderId: "kadoOrderId", nonce: "nonce" },
        kadoStatusResponse
      )
    }).rejects.toThrowError("Purchase amount does not match")
    expect(createTicketSpy).not.toHaveBeenCalled()
  })

  it("Should create a ticket if all validations pass", async () => {
    const createTicketSpy = vi.spyOn(
      await import("lib/ticket/server"),
      "createTicket"
    )
    prisma.purchase.findFirst.mockResolvedValue(
      purchaseFactory(
        10,
        "tx",
        "nonce",
        "kadoOrderId",
        $Enums.PurchaseStatus.PENDING,
        {
          name: "test",
          email: "test@test.com",
          eventId: "event",
          priceTierId: "tier",
          totalPrice: 10,
        }
      )
    )
    const kadoStatusResponse = kadoOrderStatusResponseFactory(
      true,
      "settled",
      "success",
      10
    )
    vi.stubEnv(
      "NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY",
      kadoStatusResponse.data.sendTo
    )
    const ticketResponse = ticketFactory(10, 10, "kado", "1234567890")
    // @ts-expect-error ticket create return type doesn't match but this test doesn't care
    prisma.ticket.create.mockResolvedValue(ticketResponse)
    prisma.$transaction.mockImplementation(async (run) => run(prisma))
    vi.spyOn(Inngest.prototype, "send").mockResolvedValue({ ids: ["test"] })
    const res = await completePurchase(
      { orderId: "kadoOrderId", nonce: "nonce" },
      kadoStatusResponse
    )
    expect(createTicketSpy).toHaveBeenCalledOnce()
    expect(res.orderId).toEqual("kadoOrderId")
    expect(res.nonce).toEqual("nonce")
    expect(res.merchOptions).toEqual(ticketResponse?.selectedMerchOptions)
    expect(res.source).toEqual("kado")
    expect(res.totalPrice).toEqual(10)
  })
})

describe("Initiating purchase", () => {
  it("Should throw an error if price tier does not exist", async () => {
    prisma.priceTier.findUnique.mockResolvedValue(null)
    await expect(
      // @ts-expect-error test
      initiatePurchase({ values: {}, priceTierId: 1, promocode: null })
    ).rejects.toThrowError("Price tier does not exist")
  })

  it("Should throw an error if no price is available", async () => {
    prisma.priceTier.findUnique.mockResolvedValue(priceTierFactory("test", 10))
    vi.spyOn(await import("lib/utils"), "getCurrentPrice")
      // @ts-expect-error test
      .mockReturnValue({ price: BigInt(1), isAvailable: false })
    await expect(
      // @ts-expect-error test
      initiatePurchase({ values: {}, priceTierId: 1, promocode: null })
    ).rejects.toThrowError("No price available")
  })

  it("Should apply promocode if provided", async () => {
    const priceTierMock = priceTierFactory("test", 10)
    prisma.priceTier.findUnique.mockResolvedValue(priceTierMock)
    vi.spyOn(await import("lib/utils"), "getCurrentPrice").mockReturnValue({
      price: 100,
      isAvailable: true,
    })
    prisma.promoCode.findFirst.mockResolvedValue(promoCodeFactory(10, null))
    prisma.purchase.create.mockResolvedValue(
      purchaseFactory(10, "", "test", "1234567890", "COMPLETED")
    )
    const res = await initiatePurchase({
      // @ts-expect-error test
      values: {},
      // @ts-expect-error test
      priceTierId: 1,
      promocode: "PROMO",
    })
    expect(res.totalPrice).toBe(90)
    expect(res.priceWithPromocode).toBe(90)
    expect(res.nonce).toBe("test")
  })

  it("Should create a purchase with correct data", async () => {
    const priceTierMock = priceTierFactory("test", 10)
    prisma.priceTier.findUnique.mockResolvedValue(priceTierMock)
    vi.spyOn(await import("lib/utils"), "getCurrentPrice").mockReturnValue({
      price: 100,
      isAvailable: true,
    })
    prisma.promoCode.findFirst.mockResolvedValue(promoCodeFactory(10, null))
    prisma.purchase.create.mockResolvedValue(
      purchaseFactory(10, "", "test", "1234567890", "COMPLETED")
    )
    await initiatePurchase({
      values: {
        name: "John",
        email: "john@example.com",
        merch: { tShirt: { size: "xxl" } },
      },
      priceTierId: priceTierMock.id,
      promocode: "PROMO",
    })
    expect(prisma.purchase.create).toHaveBeenCalledWith({
      data: {
        tx: "",
        nonce: expect.any(String),
        data: {
          name: "John",
          email: "john@example.com",
          merchOptions: { tShirt: { size: "xxl" } },
          priceWithPromocode: 90,
          totalPrice: 90,
          promocode: "PROMO",
          eventId: "eventId",
          priceTierId: priceTierMock.id,
          priceOptionId: undefined,
        },
      },
    })
  })
})
