import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getPriceTier, PriceTier } from "lib/price-tier"
import AdminList from "components/Admin/AdminList"
import { getPriceTierPriceOptions, PriceOption } from "lib/price-option"
import AdminPanel from "components/Admin/AdminPanel"
import { getPriceTierPromoCodes, PromoCode } from "lib/promocode"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit price tier",
  }
}

const getServerSideProps: (params: {
  priceTierId: string
}) => Promise<EditPriceTierPageProps> = async ({ priceTierId }) => {
  const priceTier = await getPriceTier(priceTierId)
  const priceOptions = await getPriceTierPriceOptions(priceTierId)
  const promoCodes = await getPriceTierPromoCodes(priceTierId)

  return {
    priceTier: priceTier ?? undefined,
    priceOptions,
    promoCodes,
  }
}

interface EditPriceTierPageProps {
  priceTier?: PriceTier
  priceOptions: PriceOption[]
  promoCodes: PromoCode[]
}

const EditPriceTierPage = async ({
  params,
}: {
  params: Promise<{ id: string; priceTierId: string }>
}) => {
  const { id: eventId, priceTierId } = await params
  const { priceTier, priceOptions, promoCodes } = await getServerSideProps({
    priceTierId,
  })

  return (
    <AdminLayout
      heading="Edit price tier"
      backUrl={`/admin/events/${eventId}/edit#price-tiers`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/price-tiers/${priceTier?.id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#price-tiers`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTier?.id}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
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
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={{
            ...priceTier,
            options: priceTier?.options && JSON.stringify(priceTier?.options),
          }}
          hiddenValues={{ eventId }}
        />
      </AdminWrapper>
      <hr className="my-12 w-48 h-1 mx-auto bg-page-contrast/50 border-0 rounded md:my-10" />
      <h3 className="mb-4 text-lg font-bold tracking-tight font-headers">
        <a id="price-options" className="hover:underline" href="#price-options">
          Price options
        </a>
      </h3>
      <AdminPanel
        addHref={`/admin/events/${eventId}/price-tiers/${priceTier?.id}/price-options/new`}
        className="mb-4"
      />
      <AdminList
        list={priceOptions}
        printProps={[{ name: "id" }, { name: "price" }, { name: "label" }]}
        getEditHref={(id) =>
          `/admin/events/${eventId}/price-tiers/${priceTier?.id}/price-options/${id}/edit`
        }
        getDeleteHref={(id) =>
          `/api/admin/price-options/${id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTier?.id}/edit#price-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTier?.id}/edit#price-options`)}`
        }
      />
      <hr className="my-12 w-48 h-1 mx-auto bg-page-contrast/50 border-0 rounded md:my-10" />
      <h3 className="mb-4 text-lg font-bold tracking-tight font-headers">
        <a id="promo-codes" className="hover:underline" href="#promo-codes">
          Promo codes
        </a>
      </h3>
      <AdminPanel
        addHref={`/admin/events/${eventId}/price-tiers/${priceTier?.id}/promo-codes/new`}
        className="mb-4"
      />
      <AdminList
        list={promoCodes}
        printProps={[
          { name: "id" },
          { name: "code" },
          { name: "discountPercent" },
          { name: "discountUSD" },
          { name: "startDate" },
          { name: "endDate" },
          { name: "usageLimit" },
          { name: "_count" },
        ]}
        getEditHref={(id) =>
          `/admin/events/${eventId}/price-tiers/${priceTier?.id}/promo-codes/${id}/edit`
        }
        getDeleteHref={(id) =>
          `/api/admin/promo-codes/${id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTier?.id}/edit#promo-codes`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/price-tiers/${priceTier?.id}/edit#promo-codes`)}`
        }
      />
    </AdminLayout>
  )
}

EditPriceTierPage.auth = true

export default EditPriceTierPage
