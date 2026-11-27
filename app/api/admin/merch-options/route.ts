import { createMerchOption, CreateMerchOptionParams } from "lib/merch-option"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreateMerchOptionParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data = {
    ...body,
    id: body.id || undefined,
  }

  try {
    data.options = body.options ? JSON.parse(body.options as string) : null
  } catch (_error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Options must be a valid JSON"}`
    )
  }

  try {
    await createMerchOption(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}
