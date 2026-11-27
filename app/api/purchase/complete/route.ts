import { completePurchase } from "lib/purchase/server"
import { CompletePurchaseParams } from "lib/purchase/types"
import { getBody } from "lib/server-utils"
import { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const body = await getBody<CompletePurchaseParams>(request)

  if (!("txId" in body) || !body.txId || !body.nonce) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    const res = await completePurchase(body)

    return Response.json(
      {
        ticketID: res.ticketId,
        txId: res.txId,
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      {
        error: error?.message ?? "Unexpected error",
      },
      { status: 500 }
    )
  }
}
