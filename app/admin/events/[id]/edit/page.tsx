import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getEvent, Event, PriceTier, getEventPriceTiers } from "lib/event"
import AdminList from "components/Admin/AdminList"
import AdminPanel from "components/Admin/AdminPanel"
import { getEventMerchOptions, MerchOption } from "lib/merch-option"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit event",
  }
}

const getServerSideProps: (params: {
  eventId: string
}) => Promise<EditEventPageProps> = async ({ eventId }) => {
  const event = await getEvent(eventId)
  const priceTiers = await getEventPriceTiers(eventId)
  const merchOptions = await getEventMerchOptions(eventId)

  return {
    event: event ?? undefined,
    priceTiers,
    merchOptions,
  }
}

interface EditEventPageProps {
  event?: Event
  priceTiers: PriceTier[]
  merchOptions: MerchOption[]
}

const EditEventPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id: eventId } = await params
  const { event, priceTiers, merchOptions } = await getServerSideProps({
    eventId,
  })

  return (
    <AdminLayout heading="Edit event" backUrl={"/admin/events"}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/events/${eventId}?backUrl=${encodeURIComponent("/admin/events")}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
            { name: "title", type: "text", required: true },
            { name: "description", type: "text", required: false },
            { name: "priceTierDescription", type: "text", required: false },
            { name: "disclaimer", type: "text", required: false },
            { name: "date", type: "date", required: true },
            { name: "published", type: "boolean", required: false },
            {
              name: "ticketsAvailabilityDuration",
              type: "number",
              required: false,
            },
            { name: "blinkURL", type: "text", required: false },
          ]}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={event}
        />
      </AdminWrapper>
      <hr className="my-12 w-48 h-1 mx-auto bg-page-contrast/50 border-0 rounded md:my-10" />
      <h3 className="mb-4 text-lg font-bold tracking-tight font-headers">
        <a id="merch-options" className="hover:underline" href="#merch-options">
          Merch options
        </a>
      </h3>
      <AdminPanel
        addHref={`/admin/events/${eventId}/merch-options/new`}
        className="mb-4"
      />
      <AdminList
        list={merchOptions}
        printProps={[{ name: "id" }, { name: "label" }, { name: "options" }]}
        getEditHref={(id) =>
          `/admin/events/${eventId}/merch-options/${id}/edit`
        }
        getDeleteHref={(id) =>
          `/api/admin/merch-options/${id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#merch-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#merch-options`)}`
        }
      />
      <hr className="my-12 w-48 h-1 mx-auto bg-page-contrast/50 border-0 rounded md:my-10" />
      <h3 className="mb-4 text-lg font-bold tracking-tight font-headers">
        <a id="price-tiers" className="hover:underline" href="#price-tiers">
          Price tiers
        </a>
      </h3>
      <AdminPanel
        addHref={`/admin/events/${eventId}/price-tiers/new`}
        className="mb-4"
      />
      <AdminList
        list={priceTiers}
        printProps={[
          { name: "id" },
          { name: "title" },
          { name: "price" },
          { name: "description" },
          { name: "limit" },
          { name: "options" },
          { name: "isMostPopular" },
          { name: "registrationFormURL" },
        ]}
        getEditHref={(id) => `/admin/events/${eventId}/price-tiers/${id}/edit`}
        getDeleteHref={(id) =>
          `/api/admin/price-tiers/${id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#price-tiers`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#price-tiers`)}`
        }
      />
    </AdminLayout>
  )
}

export default EditEventPage
