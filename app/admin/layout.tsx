"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import SpinnerCover from "components/UI/SpinnerCover"
import { useSession } from "next-auth/react"

const queryClient = new QueryClient()

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // https://next-auth.js.org/getting-started/client#custom-client-session-handling
  const { status } = useSession({ required: true })

  if (status === "loading") {
    return <SpinnerCover />
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
