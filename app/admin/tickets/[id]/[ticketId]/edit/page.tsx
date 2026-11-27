import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"
import { getEventPriceTiers } from "lib/event"
import { getTicket } from "lib/ticket/server"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit ticket",
  }
}

const EditTicketPage = async ({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>
}) => {
  const { id: eventId, ticketId } = await params
  const priceTiers = await getEventPriceTiers(eventId)
  const ticket = await getTicket(ticketId)

  return (
    <AdminLayout heading="Edit ticket" backUrl={`/admin/tickets/${eventId}`}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/tickets/${eventId}/${ticketId}?backUrl=${encodeURIComponent(`/admin/tickets/${eventId}`)}&errorBackUrl=${encodeURIComponent(`/admin/tickets/${eventId}/${ticketId}/edit`)}`}
          method="PUT"
          fields={[
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
            { name: "emailSentDateTime", type: "date", required: false },
          ]}
          hiddenValues={{
            priceOptionId: ticket?.priceOptionId,
            promoCodeId: ticket?.promoCodeId,
            userId: ticket?.userId,
          }}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={{
            ...ticket,
            selectedMerchOptions:
              ticket?.selectedMerchOptions &&
              JSON.stringify(ticket.selectedMerchOptions),
            user: undefined,
            priceTier: undefined,
            promoCode: undefined,
          }}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default EditTicketPage
