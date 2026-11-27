import { NextRequest } from "next/server"
import { getPurchaseByNonce } from "lib/purchase/server"
import { resSolanaActionError, resSolanaActionSuccess } from "lib/server-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nonce: string }> }
) {
  const { nonce } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const orderId = query.get("orderId")
  if (process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BY_KADO !== "true" || !orderId) {
    return resSolanaActionError({ status: 404, error: "Purchase not found" })
  }
  const purchase = await getPurchaseByNonce(nonce)
  if (!purchase || purchase.kadoOrderId !== orderId) {
    return resSolanaActionError({
      status: 404,
      error: "Purchase not found",
    })
  }
  return resSolanaActionSuccess({
    payload: { status: purchase.status, data: purchase.data },
  })
}
