import { createPriceTier, CreatePriceTierParams } from "lib/price-tier"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreatePriceTierParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: CreatePriceTierParams = {
    ...body,
    id: body.id || undefined,
    isMostPopular: body.isMostPopular ? true : false,
    limit: Number(body.limit ?? 0),
    registrationFormURL: body.registrationFormURL || undefined,
  }

  try {
    data.options = body.options ? JSON.parse(body.options as string) : null
  } catch (_error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Options must be a valid JSON"}`
    )
  }

  try {
    await createPriceTier(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}
