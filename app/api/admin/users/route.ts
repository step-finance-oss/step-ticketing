import { getBody } from "lib/server-utils"
import { createUser, CreateUserParams } from "lib/user"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<CreateUserParams>(request)
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data = {
    ...body,
    // @ts-expect-error CreateUserParams
    isInternal: body.isInternal == "true",
    id: body.id || undefined,
  }

  if (data.password && data.password.length < 6) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Password length should be more than 6 characters"}`
    )
  }

  try {
    await createUser(data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}
