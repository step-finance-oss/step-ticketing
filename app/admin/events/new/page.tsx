import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New event",
  }
}

const NewEventPage = async () => {
  return (
    <AdminLayout heading="New event" backUrl={"/admin/events"}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/events?backUrl=${encodeURIComponent("/admin/events")}&errorBackUrl=${encodeURIComponent("/admin/events/new")}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "title", type: "text", required: true },
            { name: "description", type: "text", required: false },
            { name: "priceTierDescription", type: "text", required: false },
            { name: "disclaimer", type: "text", required: false },
            { name: "date", type: "date", required: true },
            { name: "published", type: "boolean", required: false },
            {
              name: "ticketsAvailabilityDuration",
              type: "number",
              required: false,
            },
          ]}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default NewEventPage
