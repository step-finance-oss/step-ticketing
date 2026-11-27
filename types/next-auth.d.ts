import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { $Enums } from "./lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      role?: $Enums.Role
    } & DefaultSession["user"]
  }
  interface User extends DefaultUser {
    role?: $Enums.Role
  }
}
