import { ActionGetResponse, LinkedAction } from "@solana/actions"
import { getEventForAction } from "lib/event"
import { resSolanaActionError, resSolanaActionSuccess } from "lib/server-utils"
import { createQueryString, getCurrentPrice, isAbleToPay } from "lib/utils"
import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  const baseUrl = new URL(request.url).origin

  const event = await getEventForAction(eventId)

  if (!event || !event.published) {
    return resSolanaActionError({
      status: 404,
      error: "Event not found",
    })
  }

  if (!isAbleToPay(event.date, event.ticketsAvailabilityDuration)) {
    const payload: ActionGetResponse = {
      title: event.title,
      icon: event.blinkURL || `${baseUrl}/default-action-icon.png`,
      description: event.description ?? "",
      label: "View prices",
      links: {
        actions: [
          {
            label: "View prices",
            href: baseUrl,
            type: "external-link",
          },
        ],
      },
    }

    return resSolanaActionSuccess({ payload })
  }

  const parameters: LinkedAction["parameters"] = [
    {
      name: "name", // parameter name in the `href` above
      label: "Enter name", // placeholder of the text input
      required: true,
      type: "text",
    },
    {
      name: "email", // parameter name in the `href` above
      label: "Enter email", // placeholder of the text input
      required: true,
      type: "email",
    },
  ]

  event.merchOptions.forEach((item) => {
    if (!item.options) return

    Object.keys(item.options).forEach((key) => {
      const opts = item.options?.[key]

      if (!opts) return

      parameters.push({
        name: `merch_${item.label}_${key}`, // parameter name in the `href` above
        label: `Select ${item.label} ${key}`, // placeholder of the text input
        required: true,
        type: "select",
        options: opts.map((val: string) => ({
          label: val,
          value: val,
        })),
      })
    })
  })

  parameters.push({
    name: "promocode", // parameter name in the `href` above
    label: "Enter promocode", // placeholder of the text input
    required: false,
    type: "text",
  })

  parameters.push({
    name: "priceTierId",
    label: "Select a type",
    required: true,
    type: "radio",
    options: event.priceTiers
      .map((item) => {
        const { price, isAvailable } = getCurrentPrice(item)

        return {
          label: `${item.title} $${price}`,
          value: item.id,
          isAvailable,
        }
      })
      .filter(({ isAvailable }) => isAvailable),
  })

  const hrefQuery: Record<string, unknown> = {}

  parameters.forEach(({ name }) => {
    hrefQuery[name] = `{${name}}`
  })

  const payload: ActionGetResponse = {
    title: event.title,
    icon: event.blinkURL || `${baseUrl}/default-action-icon.png`,
    description: event.description ?? "",
    label: "Buy ticket",
    links: {
      actions: [
        {
          label: "Buy ticket",
          href: `${baseUrl}/api/actions/${eventId}/purchase-initiate?${createQueryString(hrefQuery)}`,
          type: "post",
          parameters,
        },
      ],
    },
  }

  return resSolanaActionSuccess({ payload })
}

export const OPTIONS = GET
