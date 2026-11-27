import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { canAccessAdmin } from "./lib/admin/access"

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  if (canAccessAdmin(token?.role, pathname, request.method)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: token ? "Forbidden" : "Sign in required" },
      { status: token ? 403 : 401 }
    )
  }
  if (token) return new NextResponse("Forbidden", { status: 403 })

  const signIn = new URL("/signin", request.url)
  signIn.searchParams.set("callbackUrl", pathname + search)
  return NextResponse.redirect(signIn)
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
}
