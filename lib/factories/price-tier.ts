import { PriceTier } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { Decimal } from "@prisma/client/runtime/library"

export const priceTierFactory: (
  title: string,
  limit: number,
  options?: string[],
  description?: string,
  price?: number | null
) => PriceTier = (title, limit, options, description, price) => {
  return {
    id: uuidv4().toString(),
    title: title,
    price: price ? new Decimal(price) : new Decimal(1),
    description: description || "test",
    limit: limit,
    options: options ?? ["option1", "option2"],
    eventId: "eventId",
    isMostPopular: false,
    registrationFormURL: null,
    priceOptions: [],
  }
}
