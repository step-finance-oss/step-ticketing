import { NextRequest, NextResponse } from "next/server"
import { getTicketByQRCode } from "lib/ticket"

export async function GET(
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qrCode: string }> }
) {
  const { id: eventId, qrCode } = await params
  const ticket = await getTicketByQRCode(qrCode, eventId)
  return NextResponse.json(ticket)
}
