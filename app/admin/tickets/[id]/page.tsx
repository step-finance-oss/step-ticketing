import AdminLayout from "components/Page/AdminLayout"
import { getTicketsByEvent, TicketExtended } from "lib/ticket"
import { Metadata } from "next"
import AdminList from "components/Admin/AdminList"
import AdminPanel from "components/Admin/AdminPanel"
import AdminTicketsToolbar from "./components/AdminTicketsToolbar"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tickets list",
  }
}

export const dynamic = "force-dynamic"

const getServerSideProps: (params: {
  eventId: string
}) => Promise<TicketsPageProps> = async ({ eventId }) => {
  const tickets = await getTicketsByEvent({
    eventId,
  })

  return {
    tickets: tickets ?? [],
  }
}

interface TicketsPageProps {
  tickets: TicketExtended[]
}

const TicketsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: eventId } = await params
  const { tickets } = await getServerSideProps({
    eventId,
  })

  return (
    <AdminLayout heading="Tickets list" backUrl="/admin/tickets">
      <AdminPanel addHref={`/admin/tickets/${eventId}/new`} className="mb-4" />
      <AdminTicketsToolbar event={eventId} list={tickets} />
      <AdminList
        list={tickets}
        printProps={[
          { name: "id" },
          { name: "name" },
          { name: "user.email" },
          { name: "priceTier.title" },
          { name: "priceTier.price" },
          { name: "selectedMerchOptions" },
          { name: "promoCode.code" },
          { name: "purchasePrice" },
          { name: "source" },
          { name: "purchaseDateTime" },
          {
            name: "notes",
          },
          { name: "checkInDateTime" },
          { name: "qrCode" },
          { name: "priceTierId" },
          { name: "priceOptionId" },
          { name: "promoCodeId" },
          { name: "txId" },
          { name: "kadoPaymentId" },
        ]}
        actions={[
          (id) => ({
            label: "Resend email",
            href: `/api/admin/tickets/${id}/resend-email`,
            confirmation: `Do you really want to resend the email for #${id}?`,
          }),
        ]}
        getEditHref={(id, item: TicketExtended) =>
          item.source === "admin"
            ? `/admin/tickets/${eventId}/${id}/edit`
            : undefined
        }
        getDeleteHref={(id, item: TicketExtended) =>
          item.source === "admin"
            ? `/api/admin/tickets/${eventId}/${id}?backUrl=${encodeURIComponent(`/admin/tickets/${eventId}`)}&errorBackUrl=${encodeURIComponent(`/admin/tickets/${eventId}`)}`
            : undefined
        }
      />
    </AdminLayout>
  )
}

export default TicketsPage
