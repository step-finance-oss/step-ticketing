import { NextRequest, NextResponse } from "next/server"
import { inngest } from "lib/inngest/client"
import { getBody } from "lib/server-utils"

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BY_KADO !== "true") {
    return Response.json({ error: "Kado is disabled" }, { status: 404 })
  }
  const body = await getBody<{ nonce: string; orderId: string }>(request)

  try {
    await inngest.send({
      name: "kado/wait-for-order-and-complete-purchase",
      data: {
        nonce: body.nonce,
        orderId: body.orderId,
      },
    })
    return NextResponse.json({ message: "Started order status polling" })
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message ?? "Unexpected error",
      },
      { status: 500 }
    )
  }
}
