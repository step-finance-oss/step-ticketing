import { UpdateTicketParams, TicketExtended } from "./types"

export const checkInTicket: (id: string) => Promise<TicketExtended> = async (
  id
) => {
  const res = await fetch(`/api/admin/tickets/${id}/check-in`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const checkOutTicket: (id: string) => Promise<TicketExtended> = async (
  id
) => {
  const res = await fetch(`/api/admin/tickets/${id}/check-out`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}

export const updateTicket: (
  id: string,
  params: UpdateTicketParams
) => Promise<TicketExtended> = async (id, params) => {
  const res = await fetch(`/api/admin/tickets/${id}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (res.ok) {
    return await res.json()
  } else {
    const { error } = await res.json()
    throw new Error(error ?? res.status)
  }
}
