import { createHash } from "node:crypto"
import { NextRequest } from "next/server"
import { afterEach, expect, it, vi } from "vitest"
import { POST as signIn } from "../../app/api/user/auth/route"
import { POST as createFirstUser } from "../../app/api/user/create/route"
import { verifyPassword } from "./password"

const db = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn(),
}))
vi.mock("lib/prisma", () => ({ default: db }))

function request(body: object) {
  return new NextRequest("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

it("upgrades a successful legacy login without exposing its verifier", async () => {
  const password = "a legacy password"
  const oldHash = createHash("sha256").update(password).digest("hex")
  db.user.findUnique.mockResolvedValue({
    id: "user",
    email: "example@test.local",
    role: "STAFF",
    password: oldHash,
  })
  db.user.updateMany.mockResolvedValue({ count: 1 })

  const response = await signIn(
    request({ email: "example@test.local", password })
  )
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({
    id: "user",
    email: "example@test.local",
    role: "STAFF",
  })
  const change = db.user.updateMany.mock.calls[0][0]
  expect(change.where).toEqual({ id: "user", password: oldHash })
  expect(await verifyPassword(password, change.data.password)).toBe("current")
})

it("leaves setup disabled without a configured token", async () => {
  vi.stubEnv("FIRST_ADMIN_SETUP_TOKEN", "")
  expect((await createFirstUser(request({}))).status).toBe(404)
  expect(db.$transaction).not.toHaveBeenCalled()
})

it("requires the setup token before consulting the database", async () => {
  vi.stubEnv("FIRST_ADMIN_SETUP_TOKEN", "expected token")
  expect(
    (await createFirstUser(request({ setupToken: "invalid" }))).status
  ).toBe(403)
  expect(db.$transaction).not.toHaveBeenCalled()
})

it("stops setup when an internal account exists", async () => {
  vi.stubEnv("FIRST_ADMIN_SETUP_TOKEN", "expected token")
  db.user.count.mockResolvedValue(1)
  db.$transaction.mockImplementation((operation) => operation(db))
  const response = await createFirstUser(
    request({
      setupToken: "expected token",
      email: "admin@test.local",
      password: "first password",
    })
  )
  expect(response.status).toBe(409)
  expect(db.user.upsert).not.toHaveBeenCalled()
})
