import AdminLayout from "components/Page/AdminLayout"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

const NewPriceOptionPage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string; priceOptionId: string }>
}) => {
  const { id: eventId, priceTierId } = await params

  return (
    <AdminLayout
      heading="New price option"
      backUrl={`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#price-options`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/price-options?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#price-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/price-options/new`)}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "label", type: "text", required: false },
            { name: "price", type: "number", required: true },
            { name: "validUntil", type: "date", required: true },
          ]}
          hiddenValues={{ priceTierId }}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default NewPriceOptionPage
