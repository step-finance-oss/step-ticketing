"use client"

import SignInForm, { SignInFormProps } from "components/SignIn/SignInForm"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const SignInContent: React.FC = () => {
  const searchParams = useSearchParams()

  const callbackUrl = searchParams?.get("callbackUrl")

  const router = useRouter()

  const handleSubmit: SignInFormProps["onSubmit"] = useCallback(
    async (values) => {
      try {
        const res = await signIn("credentials", {
          email: String(values.email),
          password: String(values.password),
          redirect: false,
        })
        if (res?.ok) {
          const destination = new URL(
            callbackUrl || "/admin",
            window.location.origin
          )
          return router.replace(
            destination.origin === window.location.origin
              ? destination.href
              : "/admin"
          )
        } else {
          return { error: "Invalid inputs" }
        }
      } catch (error) {
        return { error: error?.message ?? "Unexpected error" }
      }
    },
    [router, callbackUrl]
  )

  return <SignInForm onSubmit={handleSubmit} />
}

export default SignInContent
