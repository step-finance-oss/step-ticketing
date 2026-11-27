"use client"
import { saveAs } from "file-saver"
import { useCallback, useState } from "react"
import { twMerge } from "tailwind-merge"
import {
  contentType,
  writeCSVFromRecords,
} from "components/Admin/features/export-to-csv"
import _get from "lodash/get"

export type AdminTicketsToolbarProps = {
  className?: string
  event: string
  list: Array<object>
}

const RESEND_ENDPOINT = "/api/admin/tickets/resend-email-confirmations"

function prepareBody(eventId: string): FormData {
  const fd = new FormData()
  fd.append("ticketIds", "")
  fd.append("eventId", eventId)
  fd.append("resendAll", "true")
  return fd
}

async function handleAPIResponse(res: Response): Promise<void> {
  if (res.ok) {
    alert("Task scheduled successfully.")
  } else {
    const { error } = await res.json()
    alert(error ?? res.status)
  }
}

async function prepareCSVContent(
  list: Array<object>
): Promise<{ type: string; content: string }> {
  const content = await writeCSVFromRecords(list)

  return { content, type: contentType }
}

const AdminTicketsToolbar: React.FC<AdminTicketsToolbarProps> = (props) => {
  const { className, event, list } = props

  const [pending, setPending] = useState(false)

  const resendAllHandler = useCallback(async () => {
    if (pending) return
    setPending(true)

    const body = prepareBody(event)

    try {
      const res = await fetch(RESEND_ENDPOINT, { method: "POST", body })
      setPending(false)
      await handleAPIResponse(res)
    } catch (error) {
      setPending(false)
      alert(error?.message || "An error occurred while resending emails.")
    }
  }, [event, pending])

  const exportCSVHandler = useCallback(async () => {
    const tickets = list.map((ticket) => ({
      // explicit properties besides email just make sure values in header are ordered correctly
      // email has to be picked from user specifically cus it's not part of the table
      id: _get(ticket, "id"),
      userId: _get(ticket, "userId"),
      name: _get(ticket, "user.name"),
      email: _get(ticket, "user.email"),
      ...ticket,
    }))
    const { content, type } = await prepareCSVContent(tickets)

    const blob = new Blob([content], { type })
    saveAs(blob, `list_of_${event}_tickets.csv`)
  }, [list, event])

  return (
    <div className={twMerge(className, "py-5")}>
      <div>Total records: {list.length ?? 0}</div>
      <div className="space-x-2">
        <button
          type="button"
          disabled={list.length === 0}
          className="inline-block font-headers rounded-md ring-1 ring-inset ring-primary text-primary-contrast hover:bg-primary/20 px-3 py-2 text-center font-semibold disabled:opacity-50 leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={exportCSVHandler}
        >
          Export to .csv
        </button>
        <button
          type="button"
          disabled={list.length === 0}
          className="inline-block font-headers rounded-md ring-1 ring-inset ring-primary text-primary-contrast hover:bg-primary/20 px-3 py-2 text-center font-semibold disabled:opacity-50 leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={resendAllHandler}
        >
          {pending ? "Submitting..." : "Resend all tickets"}
        </button>
      </div>
    </div>
  )
}

export default AdminTicketsToolbar
