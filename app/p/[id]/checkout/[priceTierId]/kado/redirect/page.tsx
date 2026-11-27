import { Metadata } from "next"
import { getEvent, getEventPriceTier } from "lib/event"
import { notFound } from "next/navigation"
import KadoStatusLoader from "./components/KadoStatusLoader"
import { initiateOrderStatusPollingAPI } from "lib/kado/client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: eventId } = await params

  const event = await getEvent(eventId)

  return {
    title: `${event?.title} - Payment result`,
    description: event?.description,
  }
}

const KadoCheckoutRedirectPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; priceTierId: string }>
  searchParams: Promise<{
    nonce?: string
    status?: string
    orderId?: string
  }>
}) => {
  const { id: eventId, priceTierId } = await params
  const { orderId, nonce } = await searchParams
  const event = await getEvent(eventId)
  const priceTier = await getEventPriceTier(priceTierId)

  if (!event || !priceTier || !orderId || !nonce) {
    return notFound()
  }

  await initiateOrderStatusPollingAPI({
    nonce: nonce,
    orderId: orderId,
  })

  return (
    <KadoStatusLoader
      eventId={eventId}
      priceTierId={priceTierId}
      orderId={orderId}
      nonce={nonce}
    />
  )
}

export default KadoCheckoutRedirectPage
