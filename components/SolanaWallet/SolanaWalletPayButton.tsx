import { useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  WalletNotConnectedError,
  WalletPublicKeyError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base"
import { clusterApiUrl, Connection, Transaction } from "@solana/web3.js"
import "@solana/wallet-adapter-react-ui/styles.css"
import { completePurchaseAPI, createPurchaseAPI } from "lib/purchase/client"
import { PaymentFormValues } from "components/Payment/PaymentForm"
import { sendAndConfirmTransactionAsRawWithConfirmationStrategy } from "../../lib/solana-utils"

export interface SolanaWalletPayButtonProps {
  recipientPublicKey?: string
  currency?: "USDC"
  disabled?: boolean
  data: Partial<PaymentFormValues>
  eventId: string
  priceTierId: string
  priceOptionId?: string
  onClick?: () => void | false
  onSuccess?: (data: { priceWithPromocode?: number }) => void
  onError?: (message: string) => void
  onPending?: (pending: boolean) => void
  onWalletConnectionError?: () => void
}

const SolanaWalletPayButton: React.FC<SolanaWalletPayButtonProps> = (props) => {
  const {
    recipientPublicKey,
    disabled,
    data,
    eventId,
    priceTierId,
    priceOptionId,
    onClick,
    onSuccess,
    onError,
    onPending,
    onWalletConnectionError,
  } = props
  const { publicKey, signTransaction } = useWallet()

  const pay: () => Promise<{ priceWithPromocode?: number }> =
    useCallback(async () => {
      const { name, email, merch } = data
      if (!name || !email) throw new Error("Name or email address not provided")
      if (!publicKey) throw new WalletNotConnectedError()
      if (!recipientPublicKey) throw new WalletPublicKeyError()

      const { serializedTx, nonce, priceWithPromocode } =
        await createPurchaseAPI({
          publicKey: publicKey.toString(),
          promocode: data.promocode,
          priceTierId: priceTierId,
          priceOptionId: priceOptionId,
          name: name,
          email: email,
          eventId: eventId,
          merchOptions: merch,
        })

      if (!serializedTx || !nonce)
        throw new Error("Payment initialization failed.")

      const transaction = Transaction.from(Buffer.from(serializedTx, "base64"))

      if (!transaction) throw new Error("Transaction creation failed.")

      if (!signTransaction) throw new WalletSignTransactionError()

      const signedTransaction = await signTransaction(transaction)

      if (onPending) onPending(true)

      const connection = new Connection(
        process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || clusterApiUrl("devnet"),
        "confirmed"
      )
      // utilize proper confirmation strategy while confirming payment
      const txId = await sendAndConfirmTransactionAsRawWithConfirmationStrategy(
        connection,
        signedTransaction
      )
      if (!txId) throw new Error("Payment failed.")

      await completePurchaseAPI({ txId, nonce })

      if (onPending) onPending(false)

      return { priceWithPromocode }
    }, [
      data,
      publicKey,
      recipientPublicKey,
      signTransaction,
      onPending,
      priceTierId,
      priceOptionId,
      eventId,
    ])

  const handlePay: () => void = useCallback(async () => {
    if (onClick) {
      const canContinue = onClick()

      if (canContinue === false) return
    }

    try {
      const { priceWithPromocode } = await pay()

      if (onSuccess) onSuccess({ priceWithPromocode })
    } catch (error) {
      if (onPending) onPending(false)

      if (error instanceof WalletNotConnectedError && onWalletConnectionError) {
        return onWalletConnectionError()
      }

      if (onError) {
        if (error instanceof WalletNotConnectedError)
          return onError("Wallet not connected.")
        if (error instanceof WalletPublicKeyError)
          return onError("Public kay is not set.")
        if (error instanceof WalletSignTransactionError)
          return onError("Transaction signing failed.")

        return onError(error.message)
      }
    }
  }, [onClick, onPending, pay, onSuccess, onWalletConnectionError, onError])

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={!disabled ? handlePay : undefined}
      className="w-full font-headers block rounded-md cursor-pointer bg-primary text-primary-contrast disabled:bg-primary/40 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Pay with USDC
    </button>
  )
}

export default SolanaWalletPayButton
