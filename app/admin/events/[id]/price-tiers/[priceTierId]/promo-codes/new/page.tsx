import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New promo code",
  }
}

const NewPromoCodePage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string }>
}) => {
  const { id: eventId, priceTierId } = await params

  return (
    <AdminLayout
      heading="New promo code"
      backUrl={`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#promo-codes`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/promo-codes?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#promo-codes`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/promo-codes/new`)}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "code", type: "text", required: true },
            { name: "discountPercent", type: "number", required: false },
            { name: "discountUSD", type: "number", required: false },
            { name: "startDate", type: "date", required: true },
            { name: "endDate", type: "date", required: true },
            { name: "usageLimit", type: "number", required: false },
          ]}
          hiddenValues={{ priceTierId }}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

NewPromoCodePage.auth = true

export default NewPromoCodePage
