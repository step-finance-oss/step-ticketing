import { PriceOption } from "./event"
import { PriceTierExtended } from "./price-tier"

const MS_PER_HOUR = 1000 * 60 * 60

export const isAbleToPay = (
  date?: Date,
  ticketsAvailabilityDuration: number = 0
) => {
  if (!date) return false
  return Date.now() < date.getTime() + ticketsAvailabilityDuration * MS_PER_HOUR
}

export type FirstCurrentLastPrices<
  T extends Partial<PriceOption> = PriceOption,
> = {
  first?: T
  current?: T
  last?: T
}

export const getFirstCurrentLastPrices = <T extends Partial<PriceOption>>(
  priceOptions: T[]
): FirstCurrentLastPrices<T> => {
  const arr = [...priceOptions].sort((a, b) =>
    (a.validUntil ?? 0) > (b.validUntil ?? 0) ? 1 : -1
  )

  const now = new Date()

  const first = arr[0]
  const last = arr[arr.length - 1]
  const current = arr.find((item) => (item.validUntil ?? 0) > now) ?? last

  return {
    first: first === current ? undefined : first,
    current,
    last: last === current ? undefined : last,
  }
}

export const getCurrentPrice = (
  priceTier: Pick<PriceTierExtended, "price" | "priceOptions">
): { price: number; isAvailable: boolean; priceOptionId?: string } => {
  if (priceTier.priceOptions.length === 0) {
    return {
      price: priceTier.price ?? 0,
      isAvailable: Boolean(priceTier.price),
    }
  }
  const { current } = getFirstCurrentLastPrices(priceTier.priceOptions)
  return {
    price: current?.price ?? 0,
    isAvailable: current ? current.validUntil > new Date() : false,
    priceOptionId: current?.id,
  }
}

export const createQueryString = (date: Record<string, unknown>): string => {
  const params = new URLSearchParams("")
  Object.keys(date).map((key) => {
    if (date[key] !== undefined && date[key] !== "") {
      params.set(key, String(date[key]))
    }
  })

  return params.toString()
}
