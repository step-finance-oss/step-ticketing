import { inngest } from "lib/inngest/client"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await inngest.send({
    name: "email/send-one",
    data: {
      ticketId: id,
      force: true,
    },
  })
  return NextResponse.json({ message: "Emails scheduled" })
}
