/** The guest desk shares some URLs with administrator forms. The HTTP method
 * is part of each permission, including for forms that override it with POST. */
export function canAccessAdmin(
  role: unknown,
  pathname: string,
  method: string
) {
  if (role === "ADMIN") return true
  if (role !== "STAFF") return false

  const path = pathname.replace(/\/$/, "")
  if (method === "GET" || method === "HEAD") {
    return (
      path === "/admin" ||
      path === "/admin/p" ||
      /^\/admin\/p\/[^/]+\/guests$/.test(path) ||
      path === "/api/admin/events" ||
      /^\/api\/admin\/events\/[^/]+\/(tickets|merch-options)$/.test(path) ||
      /^\/api\/admin\/tickets\/[^/]+\/qr\/[^/]+$/.test(path) ||
      /^\/api\/admin\/tickets\/[^/]+\/(?!(check-in|check-out|update|resend-email)$)[^/]+$/.test(
        path
      )
    )
  }

  if (method === "PUT" || method === "POST") {
    if (/^\/api\/admin\/tickets\/[^/]+\/check-(in|out)$/.test(path)) return true
    return (
      method === "PUT" && /^\/api\/admin\/tickets\/[^/]+\/update$/.test(path)
    )
  }
  return false
}
