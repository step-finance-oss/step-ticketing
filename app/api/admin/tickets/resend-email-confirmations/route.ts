import { NextRequest, NextResponse } from "next/server"
import { inngest } from "lib/inngest/client"
import { getBody2 } from "lib/server-utils"
import { ResendEmailConfirmations } from "lib/mail/types"

export async function POST(request: NextRequest) {
  const body = await getBody2<ResendEmailConfirmations>(request)

  try {
    const response = await inngest.send({
      name: "email/send-multiple",
      data: {
        ticketIds: body.ticketIds,
        eventId: body.eventId,
        resendAll: body.resendAll === "true",
      },
    })

    return NextResponse.json({ message: "Emails scheduled", ids: response.ids })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error occurred while sending emails",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
