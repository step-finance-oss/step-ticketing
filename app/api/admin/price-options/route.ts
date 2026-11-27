import { createPriceOption, CreatePriceOptionParams } from "lib/price-option"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreatePriceOptionParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: CreatePriceOptionParams = {
    ...body,
    id: body.id || undefined,
    validUntil: body.validUntil && new Date(body.validUntil),
  }

  try {
    await createPriceOption(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}
