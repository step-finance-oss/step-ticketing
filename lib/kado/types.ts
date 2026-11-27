import { PaymentFormValues } from "components/Payment/PaymentForm"
import { MerchOptions } from "../purchase/types"

export type InitiatePurchaseParams = {
  values: PaymentFormValues
  priceTierId: string
  promocode?: string
}

export type InitiatePurchaseResponse = {
  nonce: string
  priceWithPromocode?: number
  totalPrice: number
}

export type CompletePurchaseParams = {
  nonce: string
  orderId: string
}

export type CompletePurchaseResponse = {
  orderId?: string
  nonce: string
  eventId: string
  priceTierId: string
  priceOptionId?: string
  name: string
  email: string
  merchOptions?: MerchOptions
  promocode?: string
  priceWithPromocode?: number
  totalPrice?: number
  source?: string
}

export type GetOrderStatusParams = {
  orderId: string
}

export type GetOrderStatusResponse = {
  success: boolean
  data: {
    recvAmount: {
      amount: number
      unit: string
    }
    txHash: string
    transferStatus: "uninitiated" | "pending" | "failed" | "settled" | "unknown"
    paymentStatus: "success" | "failed" | "pending"
    walletAddress: string
    sendTo: string
    humanStatusField: string
  }
}

export type GetInAmountParams = {
  amountOut: number
}

export type GetInAmountResponse = {
  amountIn: number
}

export type InitiateOrderPollingParams = {
  nonce: string
  orderId: string
}
