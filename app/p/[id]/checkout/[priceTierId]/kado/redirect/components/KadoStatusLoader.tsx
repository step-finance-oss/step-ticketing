"use client"

import SpinnerCover from "components/UI/SpinnerCover"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPurchaseByNonceAndKadoOrderIdAPI } from "lib/purchase/client"
import { $Enums } from "lib/prisma"
import { PurchaseData } from "lib/purchase/types"
import { GetPurchaseResponse } from "lib/purchase/types"

const RETRY_TIMEOUT = 2000
const RETRY_ATTEMPTS_LIMIT = 60

const waitSuccessStatus = async (
  nonce: string,
  orderId: string,
  attempt = 0
) => {
  let purchase: Pick<GetPurchaseResponse, "status" | "data"> | null = null

  try {
    purchase = await getPurchaseByNonceAndKadoOrderIdAPI({ nonce, orderId })
  } catch (_error) {
    purchase = null
  }

  attempt += 1

  if (purchase?.status !== $Enums.PurchaseStatus.COMPLETED) {
    if (purchase?.status === $Enums.PurchaseStatus.CANCELLED) {
      throw new Error("The payment has not been completed")
    }
    if (attempt === RETRY_ATTEMPTS_LIMIT) {
      throw new Error("Order failed to complete within reasonable time")
    }
    await new Promise((res) => setTimeout(res, RETRY_TIMEOUT))
    return await waitSuccessStatus(nonce, orderId, attempt)
  }

  return purchase
}

const beforeUnloadHandler = (event: Event) => {
  event.preventDefault()
  event.returnValue = true
}

export interface KadoStatusLoaderProps {
  eventId: string
  priceTierId: string
  orderId: string
  nonce: string
}

const KadoStatusLoader: React.FC<KadoStatusLoaderProps> = (props) => {
  const { eventId, priceTierId, orderId, nonce } = props
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const { data } = await waitSuccessStatus(nonce, orderId)

        if (!mounted) return

        const { name, email, merchOptions, priceWithPromocode } =
          data as PurchaseData

        router.replace(
          `/p/${eventId}/checkout/${priceTierId}/success?name=${name}&email=${encodeURIComponent(email)}&merch=${encodeURIComponent(JSON.stringify(merchOptions))}&totalPrice=${priceWithPromocode ?? ""}`
        )
      } catch (e) {
        if (!mounted) return

        router.replace(
          `/p/${eventId}/checkout/${priceTierId}/failed?error=${encodeURIComponent(e)}`
        )
      }
    })()

    return () => {
      mounted = false
    }
  }, [eventId, nonce, orderId, priceTierId, router])

  useEffect(() => {
    window.addEventListener("beforeunload", beforeUnloadHandler)

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
  }, [])

  return (
    <SpinnerCover
      message={
        <>
          Please wait a moment, <br />
          we are checking your payment. <br />
          Don&apos;t close the window
        </>
      }
    />
  )
}

export default KadoStatusLoader
