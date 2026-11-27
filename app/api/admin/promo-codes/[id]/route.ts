import {
  deletePromoCode,
  updatePromoCode,
  UpdatePromoCodeParams,
} from "lib/promocode"
import { getBody } from "lib/server-utils"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { _method, ...body } = await getBody<
    UpdatePromoCodeParams & { _method: string }
  >(request)
  const { id } = await params
  const query = new URLSearchParams(request.nextUrl.searchParams)
  const backUrl = String(query.get("backUrl") ?? "/")
  const errorBackUrl = String(query.get("errorBackUrl") ?? "/")

  const data: UpdatePromoCodeParams = {
    ...body,
    id: body.id || undefined,
    startDate: body.startDate && new Date(body.startDate),
    endDate: body.endDate && new Date(body.endDate),
    discountUSD: body.discountUSD || undefined,
    discountPercent: body.discountPercent || undefined,
    usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
  }

  try {
    await updatePromoCode(id, data)

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
    await deletePromoCode(id)

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
