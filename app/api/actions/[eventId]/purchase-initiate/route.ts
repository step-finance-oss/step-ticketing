import { ActionPostRequest, ActionPostResponse } from "@solana/actions"
import { PublicKey } from "@solana/web3.js"
import { getEventForAction } from "lib/event"
import { initiatePurchase } from "lib/purchase/server"
import { getCurrentPrice, isAbleToPay } from "lib/utils"
import _set from "lodash/set"
import { NextRequest } from "next/server"
import {
  getActionProp,
  resSolanaActionError,
  resSolanaActionSuccess,
} from "lib/server-utils"
import { MerchOptions } from "lib/purchase/types"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const baseUrl = new URL(request.url).origin
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const body: ActionPostRequest = await request.json()

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

  const priceTierId = String(getActionProp("priceTierId", query, body))
  const priceTier = event.priceTiers.find(({ id }) => id === priceTierId)

  if (!priceTier) {
    return resSolanaActionError({
      status: 400,
      error: "Wrong purchase data",
    })
  }

  const { isAvailable, priceOptionId } = getCurrentPrice(priceTier)

  if (!isAvailable) {
    return resSolanaActionError({
      status: 400,
      error: "Purchase not available",
    })
  }

  let sender

  try {
    sender = new PublicKey(body.account)
  } catch (error) {
    return resSolanaActionError({
      status: 400,
      error: error.message ?? "Invalid account",
    })
  }

  const promocode = String(getActionProp("promocode", query, body)) || undefined
  const name = String(getActionProp("name", query, body))
  const email = String(getActionProp("email", query, body))
  const merchOptions = getActionProp("merch", query, body) as MerchOptions

  const merch = {}

  if (body.data) {
    Object.keys(body.data).forEach((key) => {
      if (key.startsWith("merch")) {
        _set(merch as object, key.split("_").slice(1), body.data?.[key])
      }
    })
  } else {
    query.forEach((value, key) => {
      if (key.startsWith("merch")) {
        _set(merch as object, key.split("_").slice(1), value)
      }
    })
  }

  if (!name || !email) {
    return resSolanaActionError({
      status: 400,
      error: "Invalid user data",
    })
  }

  try {
    const { serializedTx, nonce } = await initiatePurchase(
      sender,
      eventId,
      priceTierId,
      priceOptionId ?? "",
      name,
      email,
      merchOptions || merch,
      promocode,
      "solana-action"
    )

    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: serializedTx,
      message: "Transaction created",
      links: {
        next: {
          type: "post",
          href: `${baseUrl}/api/actions/${eventId}/purchase-complete?nonce=${nonce}`,
        },
      },
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
