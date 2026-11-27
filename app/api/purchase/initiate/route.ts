import { initiatePurchase } from "lib/purchase/server"
import { getBody } from "lib/server-utils"
import { NextRequest } from "next/server"
import { MerchOptions } from "lib/purchase/types"

export async function POST(request: NextRequest) {
  const body = await getBody<{
    publicKey: string
    amountInUSD: number
    promocode?: string
    priceTierId: string
    eventId: string
    priceOptionId: string
    name: string
    email: string
    merchOptions?: MerchOptions
  }>(request)
  const {
    publicKey,
    promocode,
    priceTierId,
    eventId,
    name,
    email,
    merchOptions,
    priceOptionId,
  } = body

  try {
    const res = await initiatePurchase(
      publicKey,
      eventId,
      priceTierId,
      priceOptionId,
      name,
      email,
      merchOptions,
      promocode
    )

    return Response.json(res, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        error: error?.message ?? "Unexpected error",
      },
      { status: 500 }
    )
  }
}
