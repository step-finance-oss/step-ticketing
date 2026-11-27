import { useCallback, useEffect, useRef, useState } from "react"
import _set from "lodash/set"

import "@solana/wallet-adapter-react-ui/styles.css"

import SolanaWalletMultiButton from "./SolanaWalletMultiButton"
import PaymentForm, { PaymentFormValues } from "components/Payment/PaymentForm"
import ErrorMessage from "components/UI/ErrorMessage"
import SolanaWalletPayButton, {
  SolanaWalletPayButtonProps,
} from "./SolanaWalletPayButton"
import SpinnerCover from "components/UI/SpinnerCover"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { PaymentMerchOptions } from "components/Payment/PaymentMerchField"
import KadoPayButton from "./KadoPayButton"
import ErrorAlert from "components/UI/ErrorAlert"

export interface SolanaWalletPaymentFormProps {
  price: number
  currency: SolanaWalletPayButtonProps["currency"]
  recipientPublicKey?: string
  eventId: string
  priceTierId: string
  priceOptionId?: string
  onPaySuccess?: (
    data: PaymentFormValues & { priceWithPromocode?: number }
  ) => void
  merchOptions?: PaymentMerchOptions
}

const SolanaWalletPaymentForm: React.FC<SolanaWalletPaymentFormProps> = (
  props
) => {
  const {
    currency,
    recipientPublicKey,
    onPaySuccess,
    eventId,
    priceTierId,
    priceOptionId,
    merchOptions,
  } = props

  const formRef = useRef<HTMLFormElement | null>(null)

  const [data, setData] = useState<Partial<PaymentFormValues>>({})

  const [error, setError] = useState<string>()

  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false)

  const [isPaymentDisabled, setIsPaymentDisabled] = useState<boolean>(false)

  const [isTicketPending, setIsTicketPending] = useState<boolean>(false)

  const walletModal = useWalletModal()

  const handleChange: () => void = useCallback(() => {
    setIsPaymentDisabled(false)
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      const merchArr = Array.isArray(formData.getAll("merch"))
        ? formData.getAll("merch").map(String)
        : []
      let merch = {}
      merchArr.forEach((val) => {
        const valArr = val.split(/[\._]/)
        merch = _set(merch, valArr.slice(0, -1), valArr.slice(-1)[0])
      })
      setData({
        name: String(formData.get("name")) ?? "",
        email: String(formData.get("email")) ?? "",
        merch,
        promocode: formData.get("promocode")
          ? String(formData.get("promocode"))
          : undefined,
      })
    }
  }, [])

  const handlePaySuccess: (data: { priceWithPromocode?: number }) => void =
    useCallback(
      async ({ priceWithPromocode }) => {
        setIsPaymentDisabled(false)
        if (onPaySuccess)
          onPaySuccess({
            ...data,
            priceWithPromocode,
          } as PaymentFormValues)
      },
      [data, onPaySuccess]
    )

  const handlePayError: (message: string) => void = useCallback(
    (message) => {
      setIsPaymentDisabled(false)
      setError("Payment error: " + message)
    },
    [setError]
  )

  const handleWalletConnectionError: () => void = useCallback(() => {
    setIsPaymentDisabled(false)
    walletModal.setVisible(true)
  }, [walletModal])

  const handlePayClick: () => void = useCallback(() => {
    setIsPaymentDisabled(true)
    setError("")

    return formRef.current?.reportValidity()
  }, [setError])

  useEffect(() => {
    if (
      error?.includes(
        "Could not confirm your transaction due to issues with Solana RPC"
      )
    )
      setShowErrorAlert(true)
  }, [error])

  return (
    <form ref={formRef}>
      <div className="mb-8">
        <SolanaWalletMultiButton />
      </div>
      <PaymentForm onChange={handleChange} merchOptions={merchOptions} />
      <ErrorMessage className="mt-12" message={error} />
      {showErrorAlert && (
        <ErrorAlert message={error} onClose={() => setShowErrorAlert(false)} />
      )}
      <div className="mt-12">
        <SolanaWalletPayButton
          data={data}
          eventId={eventId}
          priceTierId={priceTierId}
          priceOptionId={priceOptionId}
          currency={currency}
          recipientPublicKey={recipientPublicKey}
          disabled={isPaymentDisabled}
          onClick={handlePayClick}
          onSuccess={handlePaySuccess}
          onError={handlePayError}
          onPending={setIsTicketPending}
          onWalletConnectionError={handleWalletConnectionError}
        />
      </div>
      {process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BY_KADO === "true" && (
        <div className="mt-12">
          <KadoPayButton
            data={data}
            eventId={eventId}
            priceTierId={priceTierId}
            currency={currency}
            disabled={isPaymentDisabled}
            onClick={handlePayClick}
            onSuccess={handlePaySuccess}
            onError={handlePayError}
            onPending={setIsTicketPending}
          />
        </div>
      )}
      {isTicketPending && (
        <SpinnerCover
          message={
            <>
              Please wait a moment, <br />
              we are creating your ticket
            </>
          }
        />
      )}
    </form>
  )
}

export default SolanaWalletPaymentForm
