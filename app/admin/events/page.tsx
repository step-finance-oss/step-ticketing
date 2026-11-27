import AdminLayout from "components/Page/AdminLayout"
import { Event, getEvents } from "lib/event"
import { Metadata } from "next"
import AdminList from "components/Admin/AdminList"
import AdminPanel from "components/Admin/AdminPanel"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Event list",
  }
}

const getServerSideProps: () => Promise<EventsPageProps> = async () => {
  const events = await getEvents()

  return {
    events,
  }
}

interface EventsPageProps {
  events: Event[]
}

async function EventsPage() {
  const { events } = await getServerSideProps()

  return (
    <AdminLayout heading="Event list" backUrl="/admin">
      <AdminPanel addHref="/admin/events/new" className="mb-4" />
      <AdminList
        list={events}
        printProps={[
          { name: "id" },
          { name: "title" },
          { name: "description" },
          { name: "priceTierDescription" },
          { name: "date" },
          { name: "published" },
          {
            name: "ticketsAvailabilityDuration",
          },
          { name: "blinkURL" },
        ]}
        getEditHref={(id) => `/admin/events/${id}/edit`}
        getDeleteHref={(id) =>
          `/api/admin/events/${id}?backUrl=${encodeURIComponent("/admin/events")}&errorBackUrl=${encodeURIComponent("/admin/events")}`
        }
      />
    </AdminLayout>
  )
}

export default EventsPage
