import { initiatePurchase } from "lib/kado/server"
import { getBody } from "lib/server-utils"
import { NextRequest } from "next/server"
import { InitiatePurchaseParams } from "lib/kado/types"

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BY_KADO !== "true") {
    return Response.json({ error: "Kado is disabled" }, { status: 404 })
  }
  const body = await getBody<InitiatePurchaseParams>(request)
  const { values, promocode, priceTierId } = body

  try {
    const res = await initiatePurchase({
      values,
      priceTierId,
      promocode,
    })

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
