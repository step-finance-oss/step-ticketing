import AdminLayout from "components/Page/AdminLayout"
import { Event, getEvents } from "lib/event"
import { Metadata } from "next"
import AdminLinks, { AdminLinksProps } from "components/Admin/AdminLinks"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Event list",
  }
}

const getServerSideProps: () => Promise<EventTicketsPageProps> = async () => {
  const events = await getEvents()

  const eventsList = events.map((item) => ({
    ...item,
    href: `/admin/tickets/${item.id}`,
  }))

  return {
    events,
    eventsList,
  }
}

interface EventTicketsPageProps {
  events: Event[]
  eventsList: AdminLinksProps["list"]
}

const EventTicketsPage = async () => {
  const { eventsList } = await getServerSideProps()

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

export default EventTicketsPage
