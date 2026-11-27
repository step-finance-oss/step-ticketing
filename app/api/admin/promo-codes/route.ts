import { createPromoCode, CreatePromoCodeParams } from "lib/promocode"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreatePromoCodeParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: CreatePromoCodeParams = {
    ...body,
    id: body.id || undefined,
    startDate: body.startDate && new Date(body.startDate),
    endDate: body.endDate && new Date(body.endDate),
    discountUSD: body.discountUSD || undefined,
    discountPercent: body.discountPercent || undefined,
    usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
  }

  try {
    await createPromoCode(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}
