import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type SetFn = (
  newValues: Record<string, string | void>,
  options?: { scroll?: boolean }
) => void

export const useRouteQueryAdd: () => SetFn = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const add: SetFn = useCallback(
    (newValues, options) => {
      const params = new URLSearchParams(searchParams ?? "")
      Object.keys(newValues).map((key) => {
        if (newValues[key] === undefined) {
          params.delete(key)
        } else {
          params.set(key, String(newValues[key]))
        }
      })
      router.replace(`${pathname}?${params.toString()}`, options)
    },
    [pathname, router, searchParams]
  )

  return add
}
