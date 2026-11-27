"use client"

import React, { useCallback, useMemo } from "react"
import { EventExtended, PriceTierExtended } from "lib/event"
import PriceCard from "components/Price/PriceCard"
import PaymentWrapper from "components/Payment/PaymentWrapper"
import { FirstCurrentLastPrices } from "lib/utils"
import SolanaWalletPaymentForm, {
  SolanaWalletPaymentFormProps,
} from "components/SolanaWallet/SolanaWalletPaymentForm"
import { useRouter } from "next/navigation"

interface EventCheckoutContentProps {
  event: EventExtended
  priceTier: PriceTierExtended & {
    orderedPriceOptions: FirstCurrentLastPrices
  }
  paylinkId?: string
  recipientPublicKey?: string
}

const EventCheckoutContent: React.FC<EventCheckoutContentProps> = (props) => {
  const { event, priceTier, recipientPublicKey } = props

  const priceTierCurrency = "USD"

  const router = useRouter()

  const priceTiersOptions = useMemo(
    () =>
      Array.isArray(priceTier.options) ? priceTier.options.map(String) : [],
    [priceTier.options]
  )

  const merchOptions = useMemo(() => {
    const options = {}
    event.merchOptions.forEach((opt) => {
      options[opt.label] = opt.options
    })
    return options
  }, [event.merchOptions])

  const handlePaySuccess: SolanaWalletPaymentFormProps["onPaySuccess"] =
    useCallback(
      (values) => {
        if (!event.id || !priceTier.id) return
        router.push(
          `/p/${event.id}/checkout/${priceTier.id}/success?name=${values.name}&email=${values.email}&merch=${JSON.stringify(values.merch)}&totalPrice=${values.priceWithPromocode ?? ""}`
        )
      },
      [router, event.id, priceTier.id]
    )

  return (
    <PaymentWrapper
      backHref={`/p/${event.id}`}
      left={
        <PriceCard
          id={priceTier.id}
          title={priceTier.title}
          description={priceTier.description}
          price={priceTier.price}
          orderedPriceOptions={priceTier.orderedPriceOptions}
          currency={priceTierCurrency}
          limit={priceTier.limit}
          ticketsSold={priceTier._count.tickets}
          options={priceTiersOptions}
          highlighted={priceTier.isMostPopular}
          hideButton
        />
      }
      right={
        <SolanaWalletPaymentForm
          price={
            priceTier.orderedPriceOptions.current?.price ?? priceTier.price
          }
          eventId={event.id}
          priceTierId={priceTier.id}
          priceOptionId={priceTier.orderedPriceOptions.current?.id}
          currency="USDC"
          recipientPublicKey={recipientPublicKey}
          onPaySuccess={handlePaySuccess}
          merchOptions={merchOptions}
        />
      }
    />
  )
}

export default EventCheckoutContent
