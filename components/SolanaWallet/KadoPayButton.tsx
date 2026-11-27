import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import "@solana/wallet-adapter-react-ui/styles.css"
import { createPurchaseAPI, getInAmount } from "lib/kado/client"
import { PaymentFormValues } from "components/Payment/PaymentForm"
import SpinnerCover from "components/UI/SpinnerCover"

// Uncomment if we need payment in a new window
// let w: Window | null = null

export interface KadoPayButtonProps {
  currency?: "USDC"
  disabled?: boolean
  data: Partial<PaymentFormValues>
  eventId: string
  priceTierId: string
  onClick?: () => void | false
  onSuccess?: (data: { priceWithPromocode?: number }) => void
  onError?: (message: string) => void
  onPending?: (pending: boolean) => void
}

const KadoPayButton: React.FC<KadoPayButtonProps> = (props) => {
  const { disabled, data, priceTierId, onClick, onError, eventId } = props
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)

  const pay: () => Promise<void> = useCallback(async () => {
    const { email, name, merch, promocode } = data
    if (!email) throw new Error("Email address not provided")
    if (!merch) throw new Error("Merch not provided")
    if (!name) throw new Error("Name not provided")

    const purchase = await createPurchaseAPI({
      values: { email, name, merch },
      priceTierId,
      promocode,
    })

    const { amountIn } = await getInAmount({
      amountOut: purchase.priceWithPromocode || purchase.totalPrice,
    })

    const postOrderRedirect = `${window.location.origin}/p/${eventId}/checkout/${priceTierId}/kado/redirect/?nonce=${purchase.nonce}`
    const widgetURL =
      `${process.env.NEXT_PUBLIC_KADO_FRONTEND_URL}?apiKey=${process.env.NEXT_PUBLIC_KADO_API_KEY}&theme=dark` +
      `&onPayAmount=${amountIn}&onPayCurrency=USD&onRevCurrency=USDC&cryptoList=USDC` +
      `&onToAddress=${process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY}&network=SOLANA&networkList=SOLANA&product=BUY&productList=BUY` +
      `&email=${encodeURIComponent(email)}&fiatMethodList=card&hideDepositDetails=true` +
      `&postOrderRedirect=${encodeURIComponent(postOrderRedirect)}&eagerRedirect=true&mode=minimal`

    router.push(widgetURL)

    // Uncomment if we need payment in a new window
    // if (w) {
    //   window?.addEventListener(
    //     "message",
    //     (event) => {
    //       if (event.data?.type === "RAMP_ORDER_ID") {
    //         const orderId = event.data?.payload.orderId

    //         if (orderId) {
    //           w?.close()
    //           router.push(postOrderRedirect + `&orderId=${orderId}`)
    //         }
    //       }
    //     },
    //     false
    //   )

    //   w.location = widgetURL
    // }
  }, [data, priceTierId, eventId, router])

  const handlePay: () => Promise<void> = useCallback(async () => {
    if (onClick) {
      const canContinue = onClick()
      if (canContinue === false) return
    }

    try {
      setIsPending(true)
      // Uncomment if we need payment in a new window
      // w = window.open(
      //   `${window.location.origin}/p/${eventId}/checkout/${priceTierId}/kado/pending`,
      //   "_blank"
      // )
      await pay()
    } catch (error) {
      setIsPending(false)
      // Uncomment if we need payment in a new window
      // w?.close()
      if (onError) onError(error)
    }
  }, [onClick, pay, onError])

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={!disabled ? handlePay : undefined}
        className="w-full font-headers block rounded-md cursor-pointer bg-primary text-primary-contrast disabled:bg-primary/40 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Pay with card
      </button>
      <div className="text-xs py-2 opacity-80">* Requires KYC</div>
      {isPending && <SpinnerCover message={<>Please complete the payment</>} />}
    </>
  )
}

export default KadoPayButton
