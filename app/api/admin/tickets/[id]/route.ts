import { createTicket, CreateTicketParams } from "lib/ticket"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await getBody<CreateTicketParams>(request)
  const errorUrl = new URL(`/admin/tickets/${id}/new`, request.url)

  const data = {
    ...body,
    id: undefined,
    eventId: id,
    source: "admin",
    txId: body.txId || undefined,
    purchasePrice: Number(body.purchasePrice ?? 0),
  }

  try {
    data.selectedMerchOptions = body.selectedMerchOptions
      ? JSON.parse(body.selectedMerchOptions as string)
      : null
  } catch (_error) {
    errorUrl.searchParams.set("error", "Options must be valid JSON")
    return NextResponse.redirect(errorUrl, 303)
  }

  try {
    await createTicket(data)

    return NextResponse.redirect(new URL(`/admin/tickets/${id}`, request.url), 303)
  } catch (error) {
    errorUrl.searchParams.set("error", error?.message ?? "Unexpected error")
    return NextResponse.redirect(errorUrl, 303)
  }
}
