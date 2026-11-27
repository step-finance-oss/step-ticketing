import React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Event, PriceTierExtended } from "lib/event"
import Layout from "components/Page/Layout"
import { getEvent, getEventPriceTiers } from "lib/event"
import PriceTiers, { PriceTiersProps } from "components/Price/PriceTiers"
import { Currency } from "lib/types"
import {
  FirstCurrentLastPrices,
  getFirstCurrentLastPrices,
  isAbleToPay,
} from "lib/utils"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: eventId } = await params

  const event = await getEvent(eventId)
  if (!event?.published) notFound()

  return {
    title: event?.title,
    description: event?.description,
  }
}

const getServerSideProps: (params: {
  eventId: string
}) => Promise<EventPageProps> = async ({ eventId }) => {
  const event = await getEvent(eventId)
  if (!event?.published) notFound()

  const priceTiers = await getEventPriceTiers(eventId)

  const date = event?.date
  const ticketsAvailabilityDuration = event?.ticketsAvailabilityDuration

  const extendedPriceTiers = priceTiers.map((item) => ({
    ...item,
    orderedPriceOptions: getFirstCurrentLastPrices(item.priceOptions ?? []),
  }))

  const priceTiersList = extendedPriceTiers?.map((item) => ({
    ...item,
    currency: "USD" as Currency,
    ticketsSold: item._count.tickets,
    buyHref: `/p/${eventId}/checkout/${item.id}`,
    externalBuyHref: item.registrationFormURL || undefined,
    highlighted: item.isMostPopular,
    options: Array.isArray(item.options) ? item.options.map(String) : [],
    hideButton:
      !isAbleToPay(date, ticketsAvailabilityDuration) ||
      (item.orderedPriceOptions.current &&
        item.orderedPriceOptions.current.validUntil < new Date()),
  }))

  return {
    ...event,
    priceTiers: extendedPriceTiers,
    backUrl: process.env.BACK_URL,
    priceTiersList,
  }
}

export interface EventPageProps extends Partial<Event> {
  priceTiers: (PriceTierExtended & {
    orderedPriceOptions: FirstCurrentLastPrices
  })[]
  priceTiersList: PriceTiersProps["list"]
  backUrl?: string
}

const EventPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: eventId } = await params
  const { description, backUrl, priceTiersList } = await getServerSideProps({
    eventId,
  })

  return (
    <Layout
      heading="Tickets"
      description={description ?? undefined}
      returnHref={backUrl}
    >
      <PriceTiers list={priceTiersList} />
    </Layout>
  )
}

export default EventPage
