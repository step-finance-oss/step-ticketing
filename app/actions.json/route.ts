import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions"
import { getEvents } from "lib/event"

export const GET = async () => {
  const events = await getEvents()

  const payload: ActionsJson = {
    rules: [
      ...events.filter((event) => event.published).map(({ id }) => ({
        pathPattern: `/actions/${id}/tickets`,
        apiPath: `/api/actions/${id}/tickets`,
      })),
    ],
  }

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export const OPTIONS = GET
