"use client"

import AdminLayout from "components/Page/AdminLayout"
import { Event } from "lib/event"
import AdminLinks from "components/Admin/AdminLinks"
import { useQuery } from "@tanstack/react-query"

const EventGuestsPage = () => {
  const eventsRes = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      fetch("/api/admin/events/", {
        method: "GET",
      }).then((res) => res.json()),
  })
  const events: Event[] | undefined = eventsRes.data
  const eventsList = events?.map((item) => ({
    ...item,
    href: `/admin/p/${item.id}/guests`,
  }))

  return (
    <AdminLayout heading="Event list" backUrl="/admin">
      <AdminLinks
        list={eventsList}
        printProps={[
          { name: "title" },
          { name: "description" },
          { name: "date" },
        ]}
      />
    </AdminLayout>
  )
}

export default EventGuestsPage
