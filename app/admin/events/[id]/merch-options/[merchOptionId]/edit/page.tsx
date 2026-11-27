import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getMerchOption, MerchOption } from "lib/merch-option"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit merch option",
  }
}

const getServerSideProps: (params: {
  merchOptionId: string
}) => Promise<EditMerchOptionPageProps> = async ({ merchOptionId }) => {
  const merchOption = await getMerchOption(merchOptionId)

  return {
    merchOption: merchOption ?? undefined,
  }
}

interface EditMerchOptionPageProps {
  merchOption?: MerchOption
}

const EditMerchOptionPage = async ({
  params,
}: {
  params: Promise<{ id: string; merchOptionId: string }>
}) => {
  const { id: eventId, merchOptionId } = await params
  const { merchOption } = await getServerSideProps({ merchOptionId })

  return (
    <AdminLayout
      heading="Edit merch option"
      backUrl={`/admin/events/${eventId}/edit#merch-options`}
    >
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/merch-options/${merchOption?.id}?backUrl=${encodeURIComponent(`/admin/events/${eventId}/edit#merch-options`)}&errorBackUrl=${encodeURIComponent(`/admin/events/${eventId}/merch-options/${merchOption?.id}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
            { name: "label", type: "text", required: true },
            {
              name: "options",
              label: 'options {"size":["S","M","L","XL","XXL"]}',
              type: "text",
              required: true,
            },
          ]}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={{
            ...merchOption,
            options:
              merchOption?.options && JSON.stringify(merchOption.options),
          }}
          hiddenValues={{ eventId }}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default EditMerchOptionPage
