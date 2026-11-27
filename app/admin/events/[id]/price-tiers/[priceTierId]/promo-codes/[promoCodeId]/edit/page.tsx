import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getPromoCodeById, PromoCode } from "lib/promocode"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit promo code",
  }
}

const getServerSideProps: (params: {
  promoCodeId: string
}) => Promise<EditPromoCodePageProps> = async ({ promoCodeId }) => {
  const promoCode = await getPromoCodeById(promoCodeId)

  return {
    promoCode: promoCode ?? undefined,
  }
}

interface EditPromoCodePageProps {
  promoCode?: PromoCode
}

const EditPromoCodePage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string; promoCodeId: string }>
}) => {
  const { id: eventId, priceTierId, promoCodeId } = await params
  const { promoCode } = await getServerSideProps({ promoCodeId })

  return (
    <AdminLayout
      heading="Edit promo code"
      backUrl={`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#promo-codes`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/promo-codes/${promoCode?.id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#promo-codes`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/promo-codes/${promoCode?.id}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
            { name: "code", type: "text", required: true },
            { name: "discountPercent", type: "number", required: false },
            { name: "discountUSD", type: "number", required: false },
            { name: "startDate", type: "date", required: true },
            { name: "endDate", type: "date", required: true },
            { name: "usageLimit", type: "number", required: false },
          ]}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={{ ...promoCode, _count: undefined }}
          hiddenValues={{ priceTierId }}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default EditPromoCodePage
