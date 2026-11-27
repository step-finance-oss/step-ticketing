import { CompletedAction, NextActionPostRequest } from "@solana/actions"
import { getEventForAction } from "lib/event"
import { completePurchase } from "lib/purchase/server"
import { resSolanaActionError, resSolanaActionSuccess } from "lib/server-utils"
import { isAbleToPay } from "lib/utils"
import { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const baseUrl = new URL(request.url).origin
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const body: NextActionPostRequest = await request.json()

  const event = await getEventForAction(eventId)

  if (
    !event ||
    !event.published ||
    !isAbleToPay(event.date, event.ticketsAvailabilityDuration)
  ) {
    return resSolanaActionError({
      status: 404,
      error: "Event not found",
    })
  }

  const signature = body.signature

  if (!signature) {
    return resSolanaActionError({
      status: 400,
      error: "Invalid signature",
    })
  }

  const nonce = query.get("nonce")
  if (!nonce) {
    return resSolanaActionError({ status: 400, error: "Invalid purchase data" })
  }

  try {
    await completePurchase({ txId: signature, nonce })

    const payload: CompletedAction = {
      type: "completed",
      title: "Payment successful!",
      icon: event.blinkURL || `${baseUrl}/default-action-icon.png`,
      label: "Complete!",
      description:
        "A confirmation email with your unique QR code will be sent to you in the coming weeks.",
    }

    return resSolanaActionSuccess({ payload })
  } catch (error) {
    return resSolanaActionError({
      status: 500,
      error: error.message ?? "Unexpected error",
    })
  }
}

export const OPTIONS = async () => resSolanaActionSuccess({ payload: null })
