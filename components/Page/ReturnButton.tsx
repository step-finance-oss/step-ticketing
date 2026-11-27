"use client"

import { useSearchParams } from "next/navigation"

const getLabel: (url: string) => string = (url) => {
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
  return (matches && matches[1]) ?? "homepage"
}

let backUrl: string

interface ReturnButtonProps {
  label?: string
  href?: string
}

const ReturnButton: React.FC<ReturnButtonProps> = (props) => {
  const { label, href } = props
  const searchParams = useSearchParams()

  const backUrlFromParams = searchParams?.get("backUrl")

  if (backUrlFromParams) {
    backUrl = backUrlFromParams
  }

  if (!backUrl && !href) {
    return null
  }

  return (
    <div className="bg-primary">
      <a
        href={href || backUrl}
        className="block font-headers px-3 py-3 text-center font-semibold leading-6 hover:bg-paper-contrast/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        ← {label ? label : `Back to ${getLabel(href || backUrl)}`}
      </a>
    </div>
  )
}

export default ReturnButton
