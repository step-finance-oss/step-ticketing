import { createQueryString } from "lib/utils"
import {
  GetInAmountParams,
  GetInAmountResponse,
  GetOrderStatusParams,
  GetOrderStatusResponse,
  InitiateOrderPollingParams,
  InitiatePurchaseParams,
  InitiatePurchaseResponse,
} from "./types"

export const createPurchaseAPI: (
  params: InitiatePurchaseParams
) => Promise<InitiatePurchaseResponse> = async (params) => {
  const res = await fetch("/api/kado/initiate-purchase", {
    method: "POST",
    body: JSON.stringify({
      values: params.values,
      priceTierId: params.priceTierId,
      promocode: params.promocode,
    }),
    headers: { "Content-Type": "application/json" },
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const getOrderStatus: (
  params: GetOrderStatusParams
) => Promise<GetOrderStatusResponse> = async (params) => {
  if (!process.env.NEXT_PUBLIC_KADO_API_URL) {
    throw new Error("NEXT_PUBLIC_KADO_API_URL is required")
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_KADO_API_URL}/v2/public/orders/${params.orderId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const getInAmount: (
  params: GetInAmountParams
) => Promise<GetInAmountResponse> = async (params) => {
  if (!process.env.NEXT_PUBLIC_KADO_API_URL) {
    throw new Error("NEXT_PUBLIC_KADO_API_URL is required")
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_KADO_API_URL}/v2/ramp/quote?${createQueryString({
      transactionType: "buy",
      fiatMethod: "credit_card",
      partner: "fortress",
      amount: params.amountOut,
      asset: "USDC",
      currency: "USD",
      blockchain: "solana",
      reverse: true,
    })}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
  if (res.ok) {
    const { data } = (await res.json()) as {
      data: {
        quote: {
          baseAmount: { amount: number; currency: string }
        }
        request: { amount: number }
      }
    }

    return { amountIn: data.request.amount }
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const initiateOrderStatusPollingAPI: (
  params: InitiateOrderPollingParams
) => Promise<{ message?: string; error?: string }> = async (params) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/kado/initiate-order-polling`,
    {
      method: "POST",
      body: JSON.stringify({
        orderId: params.orderId,
        nonce: params.nonce,
      }),
      headers: { "Content-Type": "application/json" },
    }
  )
  if (res.ok) {
    return await res.json()
  } else {
    console.log(await res.json())
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}
