import prisma from "lib/prisma"
import { getBody } from "lib/server-utils"
import { hashPassword, verifyPassword } from "lib/user/password"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const body = await getBody<{ email: string; password: string }>(request)
  if (
    typeof body?.email !== "string" ||
    !body.email ||
    typeof body.password !== "string" ||
    !body.password
  ) {
    return Response.json({ error: "Invalid inputs" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        password: true,
      },
    })
    const invalid = () =>
      Response.json({ error: "Invalid credentials" }, { status: 401 })
    if (!user?.password) return invalid()
    const { password, ...identity } = user
    const result = await verifyPassword(body.password, password)
    if (!result) return invalid()
    if (result === "legacy") {
      // A concurrent password change must take precedence over the upgrade.
      const updated = await prisma.user.updateMany({
        where: { id: user.id, password },
        data: { password: await hashPassword(body.password) },
      })
      if (!updated.count) return invalid()
    }
    return Response.json(identity)
  } catch {
    return Response.json(
      { error: "Authentication unavailable" },
      { status: 500 }
    )
  }
}
