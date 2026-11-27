"use client"

import { useCallback, useState } from "react"

export type AdminPostButtonProps = {
  className?: string
  confirmMessage?: string
  action?: string
  children?: React.ReactNode
  data?: object
}

const AdminPostButton: React.FC<AdminPostButtonProps> = (props) => {
  const { className, confirmMessage, action, children, data } = props

  const [pending, setPending] = useState(false)

  const clickHandler = useCallback(async () => {
    if (confirmMessage && !confirm(confirmMessage)) {
      return
    }
    if (!action) return
    setPending(true)
    try {
      const res = await fetch(action, {
        method: "POST",
        body: JSON.stringify(data ?? null),
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        setPending(false)
        alert("Completed successfully!")
        return await res.json()
      } else {
        setPending(false)
        const { error } = await res.json()
        alert(error ?? res.status)
      }
    } catch (error) {
      setPending(false)
      alert(error ?? error?.message)
    }
  }, [action, confirmMessage, data])

  return (
    <button
      type="button"
      disabled={pending}
      className={`${className} inline-block font-headers rounded-md ring-1 ring-inset ring-primary text-primary-contrast hover:bg-primary/20 px-3 py-2 text-center font-semibold disabled:opacity-50 leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
      onClick={clickHandler}
    >
      {pending ? "Pending..." : children}
    </button>
  )
}

export default AdminPostButton
