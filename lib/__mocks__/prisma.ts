import {
  PrismaClient,
  Event,
  PriceTier,
  Prisma,
  Ticket,
  User,
  Purchase,
  PriceOption,
  PromoCode,
  MerchOption,
  $Enums,
} from "@prisma/client"
import { beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"

beforeEach(() => {
  mockReset(prisma)
})

const prisma = mockDeep<PrismaClient>()

export default prisma

export { $Enums }

export type {
  Prisma,
  Event,
  PriceTier,
  Ticket,
  User,
  Purchase,
  PriceOption,
  PromoCode,
  MerchOption,
}
