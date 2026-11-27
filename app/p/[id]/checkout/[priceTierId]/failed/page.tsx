import React from "react"
import { Metadata } from "next"
import Layout from "components/Page/Layout"
import { getEvent } from "lib/event"
import SolanaWalletProvider from "components/SolanaWallet/SolanaWalletProvider"
import PaymentWrapper from "components/Payment/PaymentWrapper"
import { notFound } from "next/navigation"
import ErrorMessage from "components/UI/ErrorMessage"

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

const getServerSideProps: () => Promise<EventCheckoutFailedPageProps> =
  async () => {
    return {
      backUrl: process.env.BACK_URL,
    }
  }

interface EventCheckoutFailedPageProps {
  backUrl?: string
}

const EventCheckoutFailedPage = async ({
  params,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string; priceTierId: string }>
  searchParams: Promise<{
    error?: string
  }>
}) => {
  const searchParams = await searchParamsPromise
  const { id: eventId } = await params
  const { backUrl } = await getServerSideProps()

  const error =
    typeof searchParams?.error === "string" ? searchParams?.error : undefined

  if (!eventId) {
    return notFound()
  }

  return (
    <SolanaWalletProvider>
      <Layout
        heading="Payment failed"
        description="Payment failed with an error."
        returnHref={backUrl}
      >
        <PaymentWrapper
          backHref={eventId ? `/p/${eventId}` : "/"}
          left={<ErrorMessage className="mt-8" message={error} />}
        />
      </Layout>
    </SolanaWalletProvider>
  )
}

export default EventCheckoutFailedPage
