import { getBody } from "lib/server-utils"
import { deleteUser, updateUser, UpdateUserParams } from "lib/user"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { _method, ...body } = await getBody<
    UpdateUserParams & { _method: string }
  >(request)
  const { id } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: UpdateUserParams = {
    ...body,
    id: body.id || undefined,
  }

  if (data.password && data.password.length < 6) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${"Password length should be more than 6 characters"}`
    )
  }

  try {
    await updateUser(id, data)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")
  const { id } = await params

  try {
    await deleteUser(id)

    return NextResponse.redirect(`${request.nextUrl.origin}${backUrl}`)
  } catch (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}${errorBackUrl}?error=${encodeURIComponent(error?.message) ?? "Unexpected error"}`
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

  if (_method?.toUpperCase() === "DELETE") {
    return await DELETE(request, { params })
  }

  return Response.json({ error: "Method Not Allowed" }, { status: 405 })
}
