import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminForm from "components/Admin/AdminForm"
import AdminErrorMessage from "components/Admin/AdminErrorMessage"
import AdminWrapper from "components/Page/AdminWrapper"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "New first user",
  }
}

const NewFirstUserPage = async () => {
  if (!process.env.FIRST_ADMIN_SETUP_TOKEN) notFound()
  return (
    <AdminLayout heading="New first user" backUrl="/admin" hideLogoutButton>
      <AdminWrapper>
        <AdminForm
          action="/api/user/create"
          method="POST"
          fields={[
            {
              name: "setupToken",
              label: "Setup token",
              type: "password",
              required: true,
            },
            { name: "name", type: "text", required: false },
            { name: "email", type: "email", required: true },
            { name: "password", type: "password", required: true },
          ]}
          buttonText="Create"
          error={<AdminErrorMessage />}
        />
      </AdminWrapper>
    </AdminLayout>
  )
}

export default NewFirstUserPage
