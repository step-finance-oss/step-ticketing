import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New price tier",
  }
}

const NewPriceTierPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id: eventId } = await params

  return (
    <AdminLayout
      heading="New price tier"
      backUrl={`/admin/events/${eventId}/edit#price-tiers`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/price-tiers?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#price-tiers`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/new`)}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "title", type: "text", required: true },
            { name: "price", type: "number", required: true },
            { name: "description", type: "text", required: false },
            { name: "limit", type: "number", required: false },
            {
              name: "options",
              label: 'options ["option 1", "options 2"]',
              type: "text",
              required: false,
            },
            { name: "isMostPopular", type: "boolean", required: false },
            { name: "registrationFormURL", type: "text", required: false },
          ]}
          hiddenValues={{ eventId }}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

NewPriceTierPage.auth = true

export default NewPriceTierPage
