import React from "react"
import { getClosestEvent, getEventPriceTiers } from "lib/event"
import { getFirstCurrentLastPrices, isAbleToPay } from "lib/utils"
import { Currency } from "lib/types"
import Layout from "components/Page/Layout"
import PriceTiers from "components/Price/PriceTiers"
import { EventPageProps } from "./p/[id]/page"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const event = await getClosestEvent()

  return {
    title: event?.title,
    description: event?.description,
  }
}

const getServerSideProps: () => Promise<EventPageProps> = async () => {
  const event = await getClosestEvent()

  const priceTiers = event ? await getEventPriceTiers(event.id) : []

  const extendedPriceTiers = priceTiers.map((item) => ({
    ...item,
    orderedPriceOptions: getFirstCurrentLastPrices(item.priceOptions ?? []),
  }))

  const date = event?.date
  const ticketsAvailabilityDuration = event?.ticketsAvailabilityDuration

  const priceTiersList = extendedPriceTiers?.map((item) => ({
    ...item,
    currency: "USD" as Currency,
    ticketsSold: item._count.tickets,
    buyHref: `/p/${event?.id}/checkout/${item.id}`,
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

const HomePage = async () => {
  const { description, backUrl, priceTiersList } = await getServerSideProps()

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

export default HomePage
