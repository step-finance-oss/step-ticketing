import {
  CompletePurchaseParams,
  CompletePurchaseResponse,
  GetPurchaseByKadoOrderIdParams,
  GetPurchaseByNonceAndKadoOrderIdParams,
  GetPurchaseResponse,
  InitiatePurchaseParams,
  InitiatePurchaseResponse,
} from "./types"

export const createPurchaseAPI: (
  purchaseParams: InitiatePurchaseParams
) => Promise<InitiatePurchaseResponse> = async (purchaseParams) => {
  const res = await fetch("/api/purchase/initiate", {
    method: "POST",
    body: JSON.stringify(purchaseParams),
    headers: { "Content-Type": "application/json" },
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const completePurchaseAPI: (
  purchaseParams: CompletePurchaseParams
) => Promise<CompletePurchaseResponse> = async (purchaseParams) => {
  const res = await fetch("/api/purchase/complete", {
    method: "POST",
    body: JSON.stringify(purchaseParams),
    headers: { "Content-Type": "application/json" },
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const getPurchaseByNonceAndKadoOrderIdAPI: (
  params: GetPurchaseByNonceAndKadoOrderIdParams
) => Promise<Pick<GetPurchaseResponse, "status" | "data">> = async (params) => {
  const res = await fetch(
    `/api/purchase/${params.nonce}?orderId=${params.orderId}`,
    {
      method: "GET",
    }
  )
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const getPurchaseByKadoOrderIdAPI: (
  params: GetPurchaseByKadoOrderIdParams
) => Promise<GetPurchaseResponse> = async (params) => {
  const res = await fetch(
    `/api/admin/purchase/by-kado-order-id?orderId=${params.orderId}`,
    {
      method: "GET",
    }
  )
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}
