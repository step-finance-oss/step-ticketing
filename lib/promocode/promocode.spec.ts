import { test, expect } from "vitest"
import { applyPromoCode } from "./index"

// NOTE: might need to import value from other file
const USDC_UNIT_SIZE = 1e6

function percentagePromoFactory(percentage: number = 50) {
  return {
    id: "cm6s6e90r0005u00vn4yt0669",
    discountPercent: percentage,
    discountUSD: undefined,
    priceTierId: "cm6s6d4kn0003u00vixsgadoc",
    startDate: new Date("2025-02-04T17:21:00.000Z"),
    endDate: new Date("2025-03-08T17:21:00.000Z"),
    code: "discount",
    usageLimit: 100,
    _count: { tickets: 0 },
  }
}

test("should calculate percentage discount for USDC", async () => {
  expect(applyPromoCode(1, percentagePromoFactory(), USDC_UNIT_SIZE)).toBe(
    500_000
  )
})

test("should calculate percentage discount for non-decimals amount", async () => {
  expect(applyPromoCode(1, percentagePromoFactory(), undefined, 2)).toBe(0.5)
})
