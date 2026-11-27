import { waitForOrderAndCompletePurchaseFn } from "./functions"
import { test, expect, vi, describe, beforeEach } from "vitest"
import { purchaseFactory } from "../factories/purchase"
import prisma from "lib/__mocks__/prisma"
import { kadoOrderStatusResponseFactory } from "../factories/kado"

vi.mock("lib/prisma")

describe("Order completion polling", async () => {
  beforeEach(async () => {
    vi.useFakeTimers()
  })

  test("Should fail if the order already exists", async () => {
    const purchase = purchaseFactory(10, "", "test", "1234567890", "COMPLETED")
    prisma.purchase.findFirst.mockResolvedValue(purchase)
    const event = {
      data: { orderId: "1234567890", nonce: "test" },
      name: "kado/wait-for-order-and-complete-purchase",
    }
    await expect(async () => {
      await waitForOrderAndCompletePurchaseFn({ event, step: null })
    }).rejects.toThrowError("Purchase with this order ID already exists")
  })

  test("Should not be able to override orderId", async () => {
    const purchase = purchaseFactory(10, "", "nonce", "1234567890", "PENDING")
    prisma.purchase.findFirst.mockResolvedValue(purchase)
    const event = {
      data: { orderId: "1234567891", nonce: "nonce" },
      name: "kado/wait-for-order-and-complete-purchase",
    }
    await expect(async () => {
      await waitForOrderAndCompletePurchaseFn({ event, step: null })
    }).rejects.toThrowError(/Cannot overwrite an existing order ID/)
  })

  test("Should fail if kado API raises error", async () => {
    vi.spyOn(
      await import("lib/kado/client"),
      "getOrderStatus"
    ).mockRejectedValueOnce(new Error("doesn't matter"))
    await expect(async () => {
      const event = {
        data: { orderId: "1234567890", nonce: "test" },
        name: "kado/wait-for-order-and-complete-purchase",
      }
      await waitForOrderAndCompletePurchaseFn({ event, step: null })
    }).rejects.toThrowError("Invalid or malformed order ID")
  })

  test("Should complete purchase on successful order", async () => {
    const orderUpdateSpy = vi.spyOn(
      await import("lib/purchase/server"),
      "updatePurchaseKadoOrderId"
    )
    const getOrderStatusSpy = vi
      .spyOn(await import("lib/kado/client"), "getOrderStatus")
      .mockResolvedValue(
        kadoOrderStatusResponseFactory(true, "settled", "success", 10)
      )
    const completePurchaseSpy = vi
      .spyOn(await import("lib/kado/server"), "completePurchase")
      .mockResolvedValue({
        orderId: "1234567890",
        nonce: "nonce",
        eventId: "eventId",
        priceTierId: "priceTierId",
        priceOptionId: "priceOptionId",
        name: "test",
        email: "test@test.com",
        merchOptions: { label: { Size: "XXLT" } },
        promocode: "id",
        priceWithPromocode: 100,
        totalPrice: 100,
        source: "kado",
      })
    const event = {
      data: { orderId: "1234567890", nonce: "test" },
      name: "kado/wait-for-order-and-complete-purchase",
    }
    await waitForOrderAndCompletePurchaseFn({ event, step: null })
    expect(orderUpdateSpy).to.toHaveBeenCalledOnce()
    expect(getOrderStatusSpy).to.toHaveBeenCalledOnce()
    expect(completePurchaseSpy).to.toHaveBeenCalledOnce()
  })
})
