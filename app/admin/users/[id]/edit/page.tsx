import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import { getUser, User } from "lib/user"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"
import { $Enums } from "../../../../../lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edit user",
  }
}

const getServerSideProps: (params: {
  userId: string
}) => Promise<EditUserPageProps> = async ({ userId }) => {
  const user = await getUser({ id: userId })

  return {
    user: user ?? undefined,
  }
}

interface EditUserPageProps {
  user?: User
}

const EditUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id: userId } = await params
  const { user } = await getServerSideProps({ userId })

  return (
    <AdminLayout heading="Edit user" backUrl={"/admin/users"}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/users/${user?.id}?backUrl=${encodeURIComponent("/admin/users")}&errorBackUrl=${encodeURIComponent(`/admin/users/${user?.id}/edit`)}`}
          method="PUT"
          fields={[
            { name: "id", type: "text", required: false, disabled: true },
            { name: "name", type: "text", required: false },
            { name: "email", type: "email", required: true },
            {
              name: "role",
              type: "select",
              required: true,
              options: Object.keys($Enums.Role).map((key) => ({
                value: key,
                label: $Enums.Role[key],
              })),
            },
            { name: "password", type: "password", required: false },
          ]}
          buttonText="Save"
          error={<AdminErrorMessage />}
          defaultValues={user}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

EditUserPage.auth = true

export default EditUserPage
