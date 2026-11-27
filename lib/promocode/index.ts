import prisma, { PromoCode } from "lib/prisma"

type NormalizedPromoCode = Omit<
  PromoCode,
  "discountPercent" | "discountUSD"
> & {
  discountPercent?: number
  discountUSD?: number
  _count: {
    tickets: number
  }
}
type CreatePromoCodeParams = Partial<NormalizedPromoCode> &
  Pick<NormalizedPromoCode, "startDate" | "endDate" | "priceTierId" | "code">
type UpdatePromoCodeParams = Partial<NormalizedPromoCode>

export type {
  NormalizedPromoCode as PromoCode,
  CreatePromoCodeParams,
  UpdatePromoCodeParams,
}

export const getPriceTierPromoCodes: (
  priceTierId: string
) => Promise<NormalizedPromoCode[]> = async (priceTierId) => {
  const res = await prisma.promoCode.findMany({
    where: {
      priceTierId,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  })

  return res
    ? res.map((item) => ({
        ...item,
        discountPercent: item.discountPercent?.toNumber(),
        discountUSD: item.discountUSD?.toNumber(),
      }))
    : []
}

export const getPromoCodeById: (
  id: string
) => Promise<NormalizedPromoCode | null> = async (id) => {
  const res = await prisma.promoCode.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  })

  return res
    ? {
        ...res,
        discountPercent: res.discountPercent?.toNumber(),
        discountUSD: res.discountUSD?.toNumber(),
      }
    : res
}

export const getPromoCode: (
  code: string,
  priceTierId?: string
) => Promise<NormalizedPromoCode | null> = async (code, priceTierId) => {
  const currentTime = new Date()
  const res = await prisma.promoCode.findFirst({
    where: {
      code,
      startDate: { lte: currentTime },
      endDate: { gte: currentTime },
      OR: [{ priceTierId: null }, { priceTierId: priceTierId }],
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  })

  return res
    ? {
        ...res,
        discountPercent: res.discountPercent?.toNumber(),
        discountUSD: res.discountUSD?.toNumber(),
      }
    : res
}

export const createPromoCode: (
  params: CreatePromoCodeParams
) => Promise<Omit<NormalizedPromoCode, "_count">> = async (params) => {
  const res = await prisma.promoCode.create({
    data: params,
  })

  return res
    ? {
        ...res,
        discountPercent: res.discountPercent?.toNumber(),
        discountUSD: res.discountUSD?.toNumber(),
      }
    : res
}

export const updatePromoCode: (
  id: string,
  params: UpdatePromoCodeParams
) => Promise<Omit<NormalizedPromoCode, "_count">> = async (id, params) => {
  const res = await prisma.promoCode.update({
    where: {
      id,
    },
    data: params,
  })

  return res
    ? {
        ...res,
        discountPercent: res.discountPercent?.toNumber(),
        discountUSD: res.discountUSD?.toNumber(),
      }
    : res
}

export const deletePromoCode: (
  id: string
) => Promise<Omit<NormalizedPromoCode, "_count">> = async (id) => {
  const res = await prisma.promoCode.delete({
    where: {
      id,
    },
  })

  return res
    ? {
        ...res,
        discountPercent: res.discountPercent?.toNumber(),
        discountUSD: res.discountUSD?.toNumber(),
      }
    : res
}

export const applyPromoCode: (
  amountInUSD: number,
  promoCode: NormalizedPromoCode | null,
  decimals?: number,
  fixed?: number
) => number = (amountInUSD, promoCode, decimals = 1, fixed = 0) => {
  if (
    !promoCode ||
    (typeof promoCode.usageLimit === "number" &&
      promoCode.usageLimit <= promoCode._count.tickets)
  )
    throw new Error("Promo code is not valid")

  if (promoCode.discountPercent) {
    return Number(
      (
        amountInUSD *
        ((100 - promoCode.discountPercent) / 100) *
        decimals
      ).toFixed(fixed)
    )
  } else if (promoCode.discountUSD) {
    return Number(
      ((amountInUSD - promoCode.discountUSD) * decimals).toFixed(fixed)
    )
  } else {
    throw new Error("Promo code is not valid")
  }
}
