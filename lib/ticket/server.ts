import prisma, { Prisma } from "lib/prisma"
import {
  Ticket,
  CreateTicketParams,
  GetTicketsByEventParams,
  TicketExtended,
  UpdateTicketParams,
} from "./types"
import { v4 as uuidv4 } from "uuid"

export const createTicket: (
  ticketParams: CreateTicketParams,
  db?: Prisma.TransactionClient
) => Promise<Ticket> = async (ticketParams, db = prisma) => {
  let promocodeId: string | undefined = undefined

  if (ticketParams.promocode) {
    const promocodeRes = await db.promoCode.findFirst({
      where: { code: ticketParams.promocode },
    })

    promocodeId = promocodeRes?.id
  }

  const ticketRes = await db.ticket.create({
    data: {
      user: {
        connectOrCreate: {
          where: { email: ticketParams.email },
          create: {
            name: ticketParams.name,
            email: ticketParams.email,
          },
        },
      },
      event: {
        connect: { id: ticketParams.eventId },
      },
      priceTier: { connect: { id: ticketParams.priceTierId } },
      promoCode: promocodeId ? { connect: { id: promocodeId } } : undefined,
      priceOption: ticketParams.priceOptionId
        ? { connect: { id: ticketParams.priceOptionId } }
        : undefined,
      qrCode: uuidv4(),
      isPaid: true,
      selectedMerchOptions: ticketParams.selectedMerchOptions ?? {},
      name: ticketParams.name,
      txId: ticketParams.txId,
      purchasePrice: ticketParams.purchasePrice,
      source: ticketParams.source ?? null,
      kadoPaymentId: ticketParams.kadoPaymentId,
      purchase: ticketParams.purchaseId
        ? { connect: { id: ticketParams.purchaseId } }
        : undefined,
      nonce: ticketParams.nonce ?? null,
      payerWalletAddress: ticketParams.payerWalletAddress ?? null,
    },
  })

  return ticketRes
    ? {
        ...ticketRes,
        purchasePrice: ticketRes.purchasePrice?.toNumber() ?? null,
      }
    : ticketRes
}

export const getTicketsByEvent: (
  params: GetTicketsByEventParams
) => Promise<TicketExtended[]> = async (params) => {
  const res = await prisma.ticket.findMany({
    where: {
      eventId: params.eventId,
      OR: [
        {
          qrCode: params.search,
        },
        {
          user: {
            name: {
              contains: params.search,
            },
          },
        },
        {
          user: {
            email: {
              contains: params.search,
            },
          },
        },
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
      priceTier: true,
      promoCode: true,
    },
    take: params.limit,
  })

  return res.map((item) => ({
    ...item,
    priceTier: {
      ...item.priceTier,
      price: item.priceTier.price.toNumber(),
    },
    promoCode: item.promoCode
      ? {
          ...item.promoCode,
          discountPercent: item.promoCode?.discountPercent?.toNumber(),
          discountUSD: item.promoCode?.discountUSD?.toNumber(),
        }
      : null,
    purchasePrice: item.purchasePrice?.toNumber() ?? null,
  }))
}

export const getTicket: (
  ticketId: string,
  eventId?: string
) => Promise<TicketExtended | null> = async (id, eventId) => {
  const res = await prisma.ticket.findUnique({
    where: { id, eventId },
    include: {
      user: { select: { name: true, email: true } },
      priceTier: true,
      promoCode: true,
    },
  })

  return res
    ? {
        ...res,
        priceTier: {
          ...res.priceTier,
          price: res.priceTier.price.toNumber(),
        },
        purchasePrice: res.purchasePrice?.toNumber() ?? null,
        promoCode: res.promoCode
          ? {
              ...res.promoCode,
              discountPercent: res.promoCode?.discountPercent?.toNumber(),
              discountUSD: res.promoCode?.discountUSD?.toNumber(),
            }
          : null,
      }
    : res
}

export const getTicketByQRCode: (
  qrCode: string,
  eventId: string
) => Promise<TicketExtended | null> = async (qrCode, eventId) => {
  const res = await prisma.ticket.findFirst({
    where: { qrCode, eventId },
    include: {
      user: { select: { name: true, email: true } },
      priceTier: true,
      promoCode: true,
    },
  })

  return res
    ? {
        ...res,
        priceTier: {
          ...res.priceTier,
          price: res.priceTier.price.toNumber(),
        },
        purchasePrice: res.purchasePrice?.toNumber() ?? null,
        promoCode: res.promoCode
          ? {
              ...res.promoCode,
              discountPercent: res.promoCode?.discountPercent?.toNumber(),
              discountUSD: res.promoCode?.discountUSD?.toNumber(),
            }
          : null,
      }
    : res
}

export const getTicketByNonce: (
  nonce: string
) => Promise<TicketExtended | null> = async (nonce) => {
  const res = await prisma.ticket.findFirst({
    where: {
      nonce,
    },
    include: {
      user: { select: { name: true, email: true } },
      priceTier: true,
      promoCode: true,
    },
  })

  return res
    ? {
        ...res,
        priceTier: {
          ...res.priceTier,
          price: res.priceTier.price.toNumber(),
        },
        purchasePrice: res.purchasePrice?.toNumber() ?? null,
        promoCode: res.promoCode
          ? {
              ...res.promoCode,
              discountPercent: res.promoCode?.discountPercent?.toNumber(),
              discountUSD: res.promoCode?.discountUSD?.toNumber(),
            }
          : null,
      }
    : res
}

export const updateTicket: (
  id: string,
  params: UpdateTicketParams
) => Promise<Ticket> = async (id, params) => {
  const res = await prisma.ticket.update({
    where: {
      id,
    },
    data: params,
  })

  return res
    ? {
        ...res,
        purchasePrice: res.purchasePrice?.toNumber() ?? null,
      }
    : res
}

export const deleteTicket: (id: string) => Promise<Ticket> = async (id) => {
  const res = await prisma.ticket.delete({
    where: {
      id,
    },
  })

  return res
    ? {
        ...res,
        purchasePrice: res.purchasePrice?.toNumber() ?? null,
      }
    : res
}
