import { $Enums } from "@prisma/client"

export type InitiatePurchaseResponse = {
  serializedTx: string
  nonce: string
  priceWithPromocode?: number
}

export type MerchOptions = {
  [label: string]: { [variant: string]: string }
}

export type InitiatePurchaseParams = {
  publicKey: string
  promocode?: string
  priceTierId: string
  priceOptionId?: string
  name: string
  email: string
  eventId: string
  merchOptions?: MerchOptions
}

export type CompletePurchaseResponse = {
  txId: string
  ticketId: string
}

export type CompletePurchaseParams = {
  txId: string
  nonce: string
}

export type GetPurchaseByNonceAndKadoOrderIdParams = {
  nonce: string
  orderId: string
}

export type GetPurchaseResponse = {
  id: string
  status: $Enums.PurchaseStatus
  nonce: string
  data: object
  amount: number
  tx: string
}

export type GetPurchaseByKadoOrderIdParams = {
  orderId: string
}

export type PurchaseData = {
  source?: "solana-wallet" | "solana-action"
  name: string
  email: string
  merchOptions?: MerchOptions
  priceWithPromocode: number | undefined
  totalPrice: number | undefined
  promocode: string | undefined
  priceOptionId: string | undefined
  eventId: string
  priceTierId: string
}
