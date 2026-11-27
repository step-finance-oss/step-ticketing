import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getPriceOption, PriceOption } from "lib/price-option"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit price option",
  }
}

const getServerSideProps: (params: {
  priceOptionId: string
}) => Promise<EditPriceOptionPageProps> = async ({ priceOptionId }) => {
  const priceOption = await getPriceOption(priceOptionId)

  return {
    priceOption: priceOption ?? undefined,
  }
}

interface EditPriceOptionPageProps {
  priceOption?: PriceOption
}

const EditPriceOptionPage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string; priceOptionId: string }>
}) => {
  const { id: eventId, priceTierId, priceOptionId } = await params
  const { priceOption } = await getServerSideProps({
    priceOptionId,
  })

  return (
    <AdminLayout
      heading="Edit price option"
      backUrl={`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#price-options`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/price-options/${priceOption?.id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/edit#price-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTierId}/price-options/${priceOption?.id}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
            { name: "label", type: "text", required: false },
            { name: "price", type: "number", required: true },
            { name: "validUntil", type: "date", required: true },
          ]}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={priceOption}
          hiddenValues={{ priceTierId }}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

EditPriceOptionPage.auth = true

export default EditPriceOptionPage
