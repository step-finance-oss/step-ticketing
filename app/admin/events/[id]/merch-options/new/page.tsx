import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New merch option",
  }
}

const NewMerchOptionPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id: eventId } = await params

  return (
    <AdminLayout
      heading="New merch option"
      backUrl={`/admin/events/${eventId}/edit#merch-options`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/merch-options?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#merch-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/merch-options/new`)}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "label", type: "text", required: true },
            {
              name: "options",
              label: 'options {"size":["S","M","L","XL","XXL"]}',
              type: "text",
              required: true,
            },
          ]}
          hiddenValues={{ eventId }}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

NewMerchOptionPage.auth = true

export default NewMerchOptionPage
