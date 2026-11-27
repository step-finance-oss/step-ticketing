import {NextRequest, NextResponse} from "next/server";
import {getTicketsByEvent} from "lib/ticket";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const search = query.get("search") || undefined
  const tickets = await getTicketsByEvent({
    eventId,
    search,
    limit: search ? 20 : undefined,
  })
  return NextResponse.json(tickets)
}