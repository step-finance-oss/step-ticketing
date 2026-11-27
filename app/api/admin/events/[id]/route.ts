import { deleteEvent, updateEvent, UpdateEventParams } from "lib/event"
import { NextRequest, NextResponse } from "next/server"
import { getBody } from "lib/server-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { _method, ...body } = await getBody<
    UpdateEventParams & { _method: string }
  >(request)
  const { id } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: UpdateEventParams = {
    ...body,
    id: body.id,
    date: body.date && new Date(body.date),
    published: body.published ? true : false,
    ticketsAvailabilityDuration: Number(body.ticketsAvailabilityDuration ?? 0),
  }

  try {
    await updateEvent(id, data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")
  const { id } = await params

  try {
    await deleteEvent(id)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { _method } = await getBody<{
    _method: string
  }>(request)

  if (_method?.toUpperCase() === "PUT") {
    return await PUT(request, { params })
  }

  if (_method?.toUpperCase() === "DELETE") {
    return await DELETE(request, { params })
  }

  return Response.json({ error: "Method Not Allowed" }, { status: 405 })
}
