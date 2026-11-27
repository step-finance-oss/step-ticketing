import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"
import { $Enums } from "lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New user",
  }
}

const NewUserPage = async () => {
  return (
    <AdminLayout heading="New user" backUrl={"/admin/users"}>
      <AdminWrapper>
        <AdminForm
          action={`/api/admin/users?backUrl=${encodeURIComponent("/admin/users")}&errorBackUrl=${encodeURIComponent("/admin/users/new")}`}
          method="POST"
          fields={[
            // { name: "id", type: "text", required: false },
            { name: "name", type: "text", required: false },
            { name: "email", type: "email", required: true },
            { name: "password", type: "password", required: true },
            {
              name: "role",
              type: "select",
              required: true,
              options: Object.keys($Enums.Role).map((key) => ({
                value: key,
                label: $Enums.Role[key],
              })),
            },
          ]}
          hiddenValues={{ isInternal: true }}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default NewUserPage
