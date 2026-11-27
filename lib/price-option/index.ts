import prisma, { PriceOption } from "lib/prisma"

type NormalizedPriceOption = Omit<PriceOption, "price"> & { price: number }
type CreatePriceOptionParams = Partial<NormalizedPriceOption> &
  Pick<NormalizedPriceOption, "priceTierId" | "validUntil" | "price">
type UpdatePriceOptionParams = Partial<NormalizedPriceOption>

export type {
  NormalizedPriceOption as PriceOption,
  CreatePriceOptionParams,
  UpdatePriceOptionParams,
}

export const getPriceTierPriceOptions: (
  priceTierId: string
) => Promise<NormalizedPriceOption[]> = async (priceTierId) => {
  const res = await prisma.priceOption.findMany({
    where: {
      priceTierId,
    },
  })

  return res
    ? res.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      }))
    : []
}

export const getPriceOption: (
  id: string
) => Promise<NormalizedPriceOption | null> = async (id) => {
  const res = await prisma.priceOption.findUnique({
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

export const createPriceOption: (
  params: CreatePriceOptionParams
) => Promise<NormalizedPriceOption> = async (params) => {
  const res = await prisma.priceOption.create({
    data: params,
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
      }
    : res
}

export const updatePriceOption: (
  id: string,
  params: UpdatePriceOptionParams
) => Promise<NormalizedPriceOption> = async (id, params) => {
  const res = await prisma.priceOption.update({
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

export const deletePriceOption: (
  id: string
) => Promise<NormalizedPriceOption> = async (id) => {
  const res = await prisma.priceOption.delete({
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
