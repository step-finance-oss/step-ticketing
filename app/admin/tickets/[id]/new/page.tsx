import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"
import { getEventPriceTiers } from "lib/event"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New ticket",
  }
}

const NewTicketPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id: eventId } = await params
  const priceTiers = await getEventPriceTiers(eventId)

  return (
    <AdminLayout heading="New ticket" backUrl={`/admin/tickets/${eventId}`}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/tickets/${eventId}?backUrl=${encodeURIComponent(`/admin/tickets/${eventId}`)}&errorBackUrl=${encodeURIComponent(`/admin/tickets/${eventId}/new`)}`}
          method="POST"
          fields={[
            { name: "name", type: "text", required: true },
            { name: "email", type: "text", required: true },
            {
              name: "selectedMerchOptions",
              label: 'selectedMerchOptions {"Tshirt":{"size":"XL"}}',
              type: "text",
              required: true,
            },
            {
              name: "priceTierId",
              type: "select",
              required: true,
              options: priceTiers.map(({ id, title }) => ({
                value: id,
                label: title,
              })),
            },
            { name: "txId", type: "text", required: false },
            { name: "kadoPaymentId", type: "text", required: false },
            { name: "purchasePrice", type: "number", required: true },
            { name: "notes", type: "text", required: false },
          ]}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default NewTicketPage
