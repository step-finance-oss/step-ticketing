import prisma, { PriceTier, PriceOption } from "lib/prisma"

type NormalizedPriceOption = Omit<PriceOption, "price"> & { price: number }
type NormalizedPriceTier = Omit<PriceTier, "price"> & { price: number }
type NormalizedPriceTierExtended = NormalizedPriceTier & {
  _count: {
    tickets: number
  }
} & {
  price: number
  priceOptions: NormalizedPriceOption[]
}
type CreatePriceTierParams = Partial<NormalizedPriceTier> &
  Pick<NormalizedPriceTier, "title" | "eventId" | "price" | "description"> & {
    options: NonNullable<NormalizedPriceTier["options"]>
  }

type UpdatePriceTierParams = Partial<NormalizedPriceTier> & {
  options: NonNullable<NormalizedPriceTier["options"]>
}

export type {
  NormalizedPriceTier as PriceTier,
  NormalizedPriceTierExtended as PriceTierExtended,
  CreatePriceTierParams,
  UpdatePriceTierParams,
}

export const getPriceTiers: () => Promise<NormalizedPriceTier[]> = async () => {
  const res = await prisma.priceTier.findMany()

  return res
    ? res.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      }))
    : []
}

export const getPriceTier: (
  id: string
) => Promise<NormalizedPriceTier | null> = async (id) => {
  const res = await prisma.priceTier.findUnique({
    where: {
      id,
    },
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
      }
    : res
}

export const getPriceTierExtended: (
  id: string
) => Promise<Omit<NormalizedPriceTierExtended, "_count"> | null> = async (
  id
) => {
  const res = await prisma.priceTier.findUnique({
    where: {
      id,
    },
    include: { priceOptions: true },
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
        priceOptions: res.priceOptions.map((subitem) => ({
          ...subitem,
          price: subitem.price.toNumber(),
        })),
      }
    : res
}

export const createPriceTier: (
  params: CreatePriceTierParams
) => Promise<NormalizedPriceTier> = async (params) => {
  const res = await prisma.priceTier.create({
    data: params,
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
      }
    : res
}

export const updatePriceTier: (
  id: string,
  params: UpdatePriceTierParams
) => Promise<NormalizedPriceTier> = async (id, params) => {
  const res = await prisma.priceTier.update({
    where: {
      id,
    },
    data: params,
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
      }
    : res
}

export const deletePriceTier: (
  id: string
) => Promise<NormalizedPriceTier> = async (id) => {
  const res = await prisma.priceTier.delete({
    where: {
      id,
    },
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
      }
    : res
}
