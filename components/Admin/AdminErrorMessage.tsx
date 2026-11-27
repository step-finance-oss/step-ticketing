"use client"

import ErrorMessage from "components/UI/ErrorMessage"
import { useSearchParams } from "next/navigation"

const AdminErrorMessage: React.FC = () => {
  const searchParams = useSearchParams()

  const error = searchParams?.get("error")

  if (!error) return null

  return <ErrorMessage className="mt-8" message={error} />
}

export default AdminErrorMessage
