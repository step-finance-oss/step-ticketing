"use client"

import AdminLayout from "components/Page/AdminLayout"
import { TicketExtended } from "lib/ticket"
import GuestsContent from "./content"
import { MerchOption } from "lib/merch-option"
import { useParams, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

const GuestsPage = () => {
  const { id: eventId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const query = searchParams.get("query") ?? undefined
  const ticketId = searchParams.get("ticketId") ?? undefined
  const qrCode = searchParams.get("qrCode") ?? undefined
  const merchOptionsRes = useQuery({
    queryKey: ["merchOptions"],
    queryFn: () =>
      fetch(`/api/admin/events/${eventId}/merch-options`, {
        method: "GET",
      }).then((res) => res.json()),
  })
  const merchOptions: MerchOption[] | undefined = merchOptionsRes.data
  const search = query ? `?search=${query}` : ""
  const ticketsRes = useQuery({
    queryKey: ["tickets", query],
    queryFn: () =>
      fetch(`/api/admin/events/${eventId}/tickets${search}`, {
        method: "GET",
      }).then((res) => res.json()),
  })
  const tickets: TicketExtended[] | undefined = ticketsRes.data
  const ticketsList = useMemo(
    () =>
      tickets?.map((item) => ({
        id: item.id,
        name: item.name ?? undefined,
        email: item.user.email ?? undefined,
        href: `/admin/p/${eventId}/guests?ticketId=${item.id}`,
        checkedIn: Boolean(item.checkInDateTime),
      })),
    [eventId, tickets]
  )
  const ticketBySearchRes = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () =>
      fetch(`/api/admin/tickets/${eventId}/${ticketId}`, {
        method: "GET",
      }).then((res) => res.json()),
    enabled: Boolean(ticketId),
  })
  const ticketByQrCodeRes = useQuery({
    queryKey: ["ticket", qrCode],
    queryFn: () =>
      fetch(`/api/admin/tickets/${eventId}/qr/${qrCode}`, {
        method: "GET",
      }).then((res) => res.json()),
    enabled: Boolean(qrCode),
  })
  const ticket: TicketExtended | undefined =
    ticketByQrCodeRes.data || ticketBySearchRes.data
  const ticketIsPending =
    ticketByQrCodeRes.isFetching || ticketBySearchRes.isFetching
  const ticketNotFound =
    Boolean(ticketId || qrCode) && !ticket && !ticketIsPending

  const normalizedMerchOptions = useMemo(() => {
    const res = {}
    merchOptions?.forEach((opt) => {
      res[opt.label] = opt.options
    })
    return res
  }, [merchOptions])

  return (
    <AdminLayout heading="Guest list" backUrl="/admin/p">
      <GuestsContent
        query={query}
        ticket={ticket}
        ticketNotFound={ticketNotFound}
        ticketIsPending={ticketIsPending}
        ticketsList={ticketsList}
        merchOptions={normalizedMerchOptions}
      />
    </AdminLayout>
  )
}

export default GuestsPage
