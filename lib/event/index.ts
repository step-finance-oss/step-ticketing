import { PriceTier, PriceTierExtended } from "lib/price-tier"
import prisma, { Event, Ticket, PriceOption, MerchOption } from "lib/prisma"

type EventExtended = Event & { merchOptions: MerchOption[] }
type NormalizedPriceOption = Omit<PriceOption, "price"> & { price: number }
type NormalizedPriceTier = Omit<PriceTier, "price"> & { price: number }
type NormalizedPriceTierExtended = Omit<PriceTierExtended, "price"> & {
  price: number
  priceOptions: NormalizedPriceOption[]
}
type CreateEventParams = Partial<Event> &
  Pick<Event, "title" | "date" | "ticketsAvailabilityDuration">

type UpdateEventParams = Partial<Event> & Pick<Event, "id">

export type {
  Event,
  EventExtended,
  NormalizedPriceTier as PriceTier,
  NormalizedPriceTierExtended as PriceTierExtended,
  Ticket,
  NormalizedPriceOption as PriceOption,
  CreateEventParams,
  UpdateEventParams,
}

export const getEvents: () => Promise<Event[]> = async () => {
  const res = await prisma.event.findMany({
    orderBy: [
      {
        date: "asc",
      },
    ],
  })

  return res ?? []
}

export const createEvent: (
  params: CreateEventParams
) => Promise<Event> = async (params) => {
  const res = await prisma.event.create({
    data: params,
  })

  return res
}

export const updateEvent: (
  id: string,
  params: UpdateEventParams
) => Promise<Event> = async (id, params) => {
  const res = await prisma.event.update({
    where: {
      id,
    },
    data: params,
  })

  return res
}

export const deleteEvent: (id: string) => Promise<Event> = async (id) => {
  const res = await prisma.event.delete({
    where: {
      id,
    },
  })

  return res
}

export const getEvent: (id: string) => Promise<EventExtended | null> = async (
  id
) => {
  const res = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      merchOptions: true,
    },
  })

  return res
}

export const getClosestEvent: () => Promise<EventExtended | null> =
  async () => {
    const res = await prisma.event.findFirst({
      where: {
        published: true,
      },
      include: {
        merchOptions: true,
      },
      orderBy: [
        {
          date: "desc",
        },
      ],
    })

    return res
  }

export const getEventPriceTiers: (
  eventId: string
) => Promise<NormalizedPriceTierExtended[]> = async (eventId) => {
  const res = await prisma.priceTier.findMany({
    where: {
      eventId,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
      priceOptions: true,
    },
    orderBy: [
      {
        price: "asc",
      },
    ],
  })

  return res
    ? res.map((item) => ({
        ...item,
        price: item.price.toNumber(),
        priceOptions: item.priceOptions.map((subitem) => ({
          ...subitem,
          price: subitem.price.toNumber(),
        })),
      }))
    : []
}

export const getEventPriceTier: (
  id: string
) => Promise<NormalizedPriceTierExtended | null> = async (id) => {
  const res = await prisma.priceTier.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
      priceOptions: true,
    },
  })

  return res
    ? {
        ...res,
        price: res.price.toNumber(),
        priceOptions: res.priceOptions.map((item) => ({
          ...item,
          price: item.price.toNumber(),
        })),
      }
    : res
}

export const getEventForAction: (id: string) => Promise<
  | (EventExtended & {
      priceTiers: NormalizedPriceTierExtended[]
    })
  | null
> = async (id) => {
  const res = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      merchOptions: true,
      priceTiers: {
        include: {
          priceOptions: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      },
    },
  })

  return res
    ? {
        ...res,
        priceTiers: res.priceTiers.map((item) => ({
          ...item,
          price: item.price.toNumber(),
          priceOptions: item.priceOptions.map((subitem) => ({
            ...subitem,
            price: subitem.price.toNumber(),
          })),
        })),
      }
    : res
}
