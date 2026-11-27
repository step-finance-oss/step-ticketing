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

// Workaround for the JSON serializer issue with the Decimal type
Prisma.Decimal.prototype.toJSON = function () {
  return this.toNumber()
}

let prisma: PrismaClient
const clientParams = {
  omit: {
    user: {
      password: true,
    },
  },
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(clientParams)
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(clientParams)
  }
  prisma = global.prisma
}

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
