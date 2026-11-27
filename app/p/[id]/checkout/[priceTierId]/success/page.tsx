import React from "react"
import { Metadata } from "next"
import { Event, PriceTierExtended } from "lib/event"
import Layout from "components/Page/Layout"
import { getEvent, getEventPriceTier } from "lib/event"
import SolanaWalletProvider from "components/SolanaWallet/SolanaWalletProvider"
import PaymentWrapper from "components/Payment/PaymentWrapper"
import { FirstCurrentLastPrices, getFirstCurrentLastPrices } from "lib/utils"
import TicketCard from "components/Ticket/TicketCard"
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
}) => Promise<EventCheckoutSuccessPageProps> = async ({
  eventId,
  priceTierId,
}) => {
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
  }
}

interface EventCheckoutSuccessPageProps {
  event?: Event
  priceTier?: PriceTierExtended & {
    orderedPriceOptions: FirstCurrentLastPrices
  }
  name?: string
  email?: string
  merch?: { [label: string]: { [variant: string]: string } }
  totalPrice?: number
  backUrl?: string
}

const EventCheckoutSuccessPage = async ({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string; priceTierId: string }>
  searchParams: Promise<{
    totalPrice?: string
    name?: string
    email?: string
    merch?: string
  }>
}) => {
  const searchParams = await searchParamsPromise
  const { id: eventId, priceTierId } = await params
  const { event, priceTier, backUrl } = await getServerSideProps({
    eventId,
    priceTierId,
  })

  const name =
    typeof searchParams?.name === "string" ? searchParams?.name : undefined
  const email =
    typeof searchParams?.email === "string" ? searchParams?.email : undefined
  const totalPrice =
    searchParams?.totalPrice && typeof searchParams.totalPrice === "string"
      ? Number(searchParams?.totalPrice)
      : undefined

  let merch: { [label: string]: { [variant: string]: string } } | undefined

  if (typeof searchParams?.merch === "string") {
    try {
      merch = JSON.parse(searchParams.merch)
    } catch (_error) {
      merch = undefined
    }
  }

  const priceTierCurrency = "USD"

  if (!event || !priceTier) {
    return notFound()
  }

  const priceTiersOptions = Array.isArray(priceTier?.options)
    ? priceTier.options.map(String)
    : []

  return (
    <SolanaWalletProvider>
      <Layout
        heading="Payment successful!"
        description="A confirmation email with your unique QR code will be sent to you in the coming weeks."
        returnHref={backUrl}
      >
        <PaymentWrapper
          backHref={event ? `/p/${event.id}` : "/"}
          left={
            <TicketCard
              id={priceTier.id}
              title={priceTier.title}
              price={
                priceTier.orderedPriceOptions.current?.price ?? priceTier.price
              }
              totalPrice={totalPrice}
              currency={priceTierCurrency}
              options={priceTiersOptions}
              highlighted={priceTier.isMostPopular}
              name={name}
              email={email}
              merch={merch}
            />
          }
        />
      </Layout>
    </SolanaWalletProvider>
  )
}

export default EventCheckoutSuccessPage
