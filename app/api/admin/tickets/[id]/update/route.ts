import { updateTicket } from "lib/ticket"
import { getBody } from "lib/server-utils"
import { NextRequest } from "next/server"

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function isMerchSelection(
  value: unknown
): value is Record<string, Record<string, string>> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (variants) =>
        isRecord(variants) &&
        Object.values(variants).every((option) => typeof option === "string")
    )
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await getBody<unknown>(request)
  if (
    !isRecord(body) ||
    Object.keys(body).length !== 1 ||
    !isMerchSelection(body.selectedMerchOptions)
  ) {
    return Response.json(
      { error: "Expected only a merchandise selection" },
      { status: 400 }
    )
  }
  const { id } = await params
  try {
    const ticket = await updateTicket(id, {
      selectedMerchOptions: body.selectedMerchOptions,
    })
    return Response.json(ticket)
  } catch {
    return Response.json(
      { error: "Could not update merchandise" },
      { status: 400 }
    )
  }
}
