import { NextRequest, NextResponse } from "next/server"
import { getEventMerchOptions } from "lib/merch-option"

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
  const event = await getEventMerchOptions(eventId)
  return NextResponse.json(event)
}
