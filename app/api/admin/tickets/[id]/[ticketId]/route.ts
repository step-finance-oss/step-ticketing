import {
  deleteTicket,
  getTicket,
  updateTicket,
  UpdateTicketParams,
} from "lib/ticket"
import { NextRequest, NextResponse } from "next/server"
import { getBody } from "lib/server-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const { _method, ...body } = await getBody<
    UpdateTicketParams & { _method: string }
  >(request)
  const { id, ticketId } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data = {
    ...body,
    id: ticketId,
    eventId: id,
    source: "admin",
    purchasePrice: Number(body.purchasePrice ?? 0),
    priceOptionId: body.priceOptionId || undefined,
    promoCodeId: body.promoCodeId || undefined,
    userId: body.userId || undefined,
  }
  console.log(data)

  try {
    if (data.emailSentDateTime !== undefined) {
      data.emailSentDateTime = data.emailSentDateTime
        ? new Date(data.emailSentDateTime)
        : null
    }
  } catch (_error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Invalid date input"}`
    )
  }

  try {
    data.selectedMerchOptions = body.selectedMerchOptions
      ? JSON.parse(body.selectedMerchOptions as string)
      : null
  } catch (_error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Options must be a valid JSON"}`
    )
  }

  try {
    await updateTicket(ticketId, data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")
  const { ticketId } = await params

  try {
    await deleteTicket(ticketId)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
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

export async function GET(
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const { id: eventId, ticketId } = await params
  const ticket = await getTicket(ticketId, eventId)
  return NextResponse.json(ticket)
}
