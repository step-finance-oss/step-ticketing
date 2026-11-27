import { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "lib/prisma"

export const nextAuthOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const userCredentials = {
          email: credentials?.email,
          password: credentials?.password,
        }
        const res = await fetch(
          `${process.env.NEXTAUTH_URL ?? ""}/api/user/auth`,
          {
            method: "POST",
            body: JSON.stringify(userCredentials),
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        const user = await res.json()

        if (res.ok && user) {
          return user
        } else {
          return null
        }
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role
      return session
    },
  },

  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 5,
  },

  pages: {
    signIn: "/signin",
    signOut: "/signin",
    error: "/signin",
  },
}
