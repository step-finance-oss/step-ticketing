import React from "react"
import { Metadata } from "next"
import { EventExtended, PriceTierExtended } from "lib/event"
import Layout from "components/Page/Layout"
import { getEvent, getEventPriceTier } from "lib/event"
import SolanaWalletProvider from "components/SolanaWallet/SolanaWalletProvider"
import {
  FirstCurrentLastPrices,
  getFirstCurrentLastPrices,
  isAbleToPay,
} from "lib/utils"
import EventCheckoutContent from "./content"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: eventId } = await params

  const event = await getEvent(eventId)

  return {
    title: `${event?.title} - Registration`,
    description: event?.description,
  }
}

const getServerSideProps: (params: {
  eventId: string
  priceTierId: string
}) => Promise<EventCheckoutPageProps> = async ({ eventId, priceTierId }) => {
  const event = await getEvent(eventId)

  const priceTier = await getEventPriceTier(priceTierId)

  const orderedPriceOptions = getFirstCurrentLastPrices(
    priceTier?.priceOptions ?? []
  )

  return {
    event: event ?? undefined,
    priceTier: priceTier
      ? {
          ...priceTier,
          orderedPriceOptions,
        }
      : undefined,
    paylinkId: process.env.HELIO_PAYLINK,
    recipientPublicKey: process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY,
    backUrl: process.env.BACK_URL,
    notAvailable:
      !event?.published ||
      !priceTier ||
      priceTier.eventId !== eventId ||
      (priceTier.limit && priceTier._count.tickets >= priceTier.limit) ||
      !isAbleToPay(event?.date, event?.ticketsAvailabilityDuration) ||
      (orderedPriceOptions.current &&
        orderedPriceOptions.current.validUntil < new Date()),
  }
}

interface EventCheckoutPageProps {
  event?: EventExtended
  priceTier?: PriceTierExtended & {
    orderedPriceOptions: FirstCurrentLastPrices
  }
  paylinkId?: string
  recipientPublicKey?: string
  backUrl?: string
  notAvailable?: boolean
}

const EventCheckoutPage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string }>
}) => {
  const { id: eventId, priceTierId } = await params
  const { event, priceTier, recipientPublicKey, backUrl, notAvailable } =
    await getServerSideProps({ eventId, priceTierId })

  if (!event || !priceTier || notAvailable) {
    return notFound()
  }

  return (
    <SolanaWalletProvider>
      <Layout
        heading="Registration"
        description={event?.priceTierDescription ?? undefined}
        returnHref={backUrl}
      >
        <EventCheckoutContent
          event={event}
          priceTier={priceTier}
          recipientPublicKey={recipientPublicKey}
        />
        <div className="py-8 text-center opacity-80 text-xs">
          {event.disclaimer ??
            "Disclaimer: All sales are final. No refunds or exchanges."}
        </div>
      </Layout>
    </SolanaWalletProvider>
  )
}

export default EventCheckoutPage
