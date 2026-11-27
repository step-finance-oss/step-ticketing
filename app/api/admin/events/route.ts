import { createEvent, CreateEventParams, getEvents } from "lib/event"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreateEventParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data = {
    ...body,
    id: body.id || undefined,
    date: body.date && new Date(body.date),
    published: body.published ? true : false,
    ticketsAvailabilityDuration: Number(body.ticketsAvailabilityDuration ?? 0),
  }

  try {
    await createEvent(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const events = await getEvents()
  return NextResponse.json(events)
}
