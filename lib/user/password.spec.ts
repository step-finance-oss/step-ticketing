import { createHash } from "node:crypto"
import { expect, it } from "vitest"
import { hashPassword, verifyPassword } from "./password"

it("uses a fresh salt for each password and checks the derived key", async () => {
  const password = "a password with ünicode"
  const first = await hashPassword(password)
  expect(await hashPassword(password)).not.toBe(first)
  expect(await verifyPassword(password, first)).toBe("current")
  expect(await verifyPassword("wrong", first)).toBe(false)
})

it("recognizes only matching legacy hashes for upgrade", async () => {
  const password = "an older password"
  const stored = createHash("sha256").update(password).digest("hex")
  expect(await verifyPassword(password, stored)).toBe("legacy")
  expect(await verifyPassword("wrong", stored)).toBe(false)
  expect(await verifyPassword(password, "scrypt-v1$broken")).toBe(false)
})
