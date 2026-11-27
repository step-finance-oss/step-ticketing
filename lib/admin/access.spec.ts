import { describe, expect, it } from "vitest"
import { canAccessAdmin } from "./access"

const staffRoutes = [
  ["GET", "/admin"],
  ["GET", "/admin/p"],
  ["GET", "/admin/p/event/guests"],
  ["GET", "/api/admin/events/"],
  ["GET", "/api/admin/events/event/merch-options"],
  ["GET", "/api/admin/events/event/tickets"],
  ["GET", "/api/admin/tickets/event/a-ticket"],
  ["GET", "/api/admin/tickets/event/qr/a-code"],
  ["PUT", "/api/admin/tickets/a-ticket/check-in"],
  ["PUT", "/api/admin/tickets/a-ticket/check-out"],
  ["PUT", "/api/admin/tickets/a-ticket/update"],
]

const adminRoutes = [
  ["GET", "/admin/purchases"],
  ["GET", "/admin/users"],
  ["GET", "/api/admin/purchase/by-kado-order-id"],
  ["POST", "/api/admin/events"],
  ["POST", "/api/admin/users"],
  ["DELETE", "/api/admin/tickets/event/a-ticket"],
  ["PUT", "/api/admin/tickets/event/a-ticket"],
  ["POST", "/api/admin/tickets/event/a-ticket"],
  ["POST", "/api/admin/tickets/a-ticket/resend-email"],
  ["POST", "/api/admin/tickets/resend-email-confirmations"],
]

describe("admin access", () => {
  it.each(staffRoutes)("allows staff desk operation %s %s", (method, path) => {
    expect(canAccessAdmin("STAFF", path, method)).toBe(true)
  })
  it.each(adminRoutes)("reserves %s %s for admins", (method, path) => {
    expect(canAccessAdmin("STAFF", path, method)).toBe(false)
    expect(canAccessAdmin("ADMIN", path, method)).toBe(true)
  })
  it.each([undefined, "GUEST", "unknown"])("denies role %s", (role) => {
    for (const [method, path] of [...adminRoutes, ...staffRoutes]) {
      expect(canAccessAdmin(role, path, method)).toBe(false)
    }
  })
})
