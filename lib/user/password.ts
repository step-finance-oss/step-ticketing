import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"

const legacyFormat = /^[a-f0-9]{64}$/
const currentFormat = /^scrypt-v1\$([a-f0-9]{32})\$([a-f0-9]{128})$/

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => {
        if (error) reject(error)
        else resolve(key)
      }
    )
  })
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await deriveKey(password, salt)
  return `scrypt-v1$${salt.toString("hex")}$${key.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  if (legacyFormat.test(stored)) {
    const digest = createHash("sha256").update(password).digest()
    return timingSafeEqual(digest, Buffer.from(stored, "hex"))
      ? "legacy"
      : false
  }
  const match = currentFormat.exec(stored)
  if (!match) return false
  const key = await deriveKey(password, Buffer.from(match[1], "hex"))
  return timingSafeEqual(key, Buffer.from(match[2], "hex")) ? "current" : false
}
