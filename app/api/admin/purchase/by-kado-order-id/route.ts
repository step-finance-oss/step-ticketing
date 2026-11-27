import { getPurchaseByKadoOrderId } from "lib/purchase/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const query = new URLSearchParams(request.nextUrl.searchParams)

  const orderId = query.get("orderId")

  if (!orderId) {
    return Response.json(
      {
        error: "Order ID required",
      },
      { status: 400 }
    )
  }

  try {
    const res = await getPurchaseByKadoOrderId(orderId)

    return Response.json(
      { ...res, amount: Number(res?.amount) },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      {
        error: error?.message ?? "Unexpected error",
      },
      { status: 400 }
    )
  }
}
