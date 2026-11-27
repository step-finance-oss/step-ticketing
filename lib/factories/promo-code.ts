import { PromoCode } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { Decimal } from "@prisma/client/runtime/library"

export const promoCodeFactory: (
  discountPercent: number | null,
  discountUSD: number | null,
  usageLimit?: number,
  countTickets?: number
) => PromoCode = (discountPercent, discountUSD, usageLimit, countTickets) => {
  return {
    id: uuidv4().toString(),
    discountPercent: discountPercent ? new Decimal(discountPercent) : null,
    discountUSD: discountUSD ? new Decimal(discountUSD) : null,
    priceTierId: "priceTierId",
    startDate: new Date(),
    endDate: new Date(),
    code: "PROMO",
    usageLimit: usageLimit || 10,
    _count: { tickets: countTickets || 0 },
  }
}
