import { getBody } from "lib/server-utils"
import { updateTicket, UpdateTicketParams } from "lib/ticket"
import { NextRequest } from "next/server"

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const data: UpdateTicketParams = {
    checkInDateTime: new Date(),
  }

  try {
    const res = await updateTicket(id, data)

    return Response.json(res, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        error: error?.message ?? "Unexpected error",
      },
      { status: 400 }
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

  return Response.json({ error: "Method Not Allowed" }, { status: 405 })
}
