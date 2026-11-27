import { timingSafeEqual } from "node:crypto"
import prisma from "lib/prisma"
import { getBody } from "lib/server-utils"
import { hashPassword } from "lib/user/password"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = process.env.FIRST_ADMIN_SETUP_TOKEN
  if (!secret) return new Response(null, { status: 404 })
  const body = await getBody<{
    setupToken?: string
    name?: string
    email?: string
    password?: string
  }>(request)
  const token =
    typeof body?.setupToken === "string"
      ? Buffer.from(body.setupToken)
      : Buffer.alloc(0)
  const expected = Buffer.from(secret)
  if (token.length !== expected.length || !timingSafeEqual(token, expected)) {
    return Response.json({ error: "Invalid setup token" }, { status: 403 })
  }
  if (
    typeof body.email !== "string" ||
    !body.email ||
    typeof body.password !== "string" ||
    body.password.length < 6 ||
    (body.name !== undefined && typeof body.name !== "string")
  ) {
    return Response.json(
      { error: "A valid email and password are required" },
      { status: 400 }
    )
  }

  const email = body.email
  const name = body.name
  const password = await hashPassword(body.password)
  try {
    const created = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.user.count({
          where: {
            OR: [{ isInternal: true }, { role: { in: ["ADMIN", "STAFF"] } }],
          },
        })
        if (existing) return false
        const data = { password, isInternal: true, role: "ADMIN" as const }
        // An attendee may already have a ticket associated with this address.
        await tx.user.upsert({
          where: { email, isInternal: false, password: null },
          create: { email, name, ...data },
          update: data,
          select: { id: true },
        })
        return true
      },
      { isolationLevel: "Serializable" }
    )
    if (created)
      return NextResponse.redirect(new URL("/admin", request.url), 303)
  } catch (error) {
    if (error?.code !== "P2034" && error?.code !== "P2002") {
      return Response.json(
        { error: "First user setup unavailable" },
        { status: 500 }
      )
    }
  }
  return Response.json(
    { error: "First user setup is already complete or the account exists" },
    { status: 409 }
  )
}
