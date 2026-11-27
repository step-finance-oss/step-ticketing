import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminLinks from "components/Admin/AdminLinks"
import { getServerSession } from "next-auth"
import { nextAuthOptions } from "lib/auth"
import { $Enums } from "lib/prisma"
import { ADMIN_LINKS, STAFF_LINKS } from "lib/admin/rbac_settings"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin",
  }
}

const AdminPage = async () => {
  const data = await getServerSession(nextAuthOptions)

  const links =
    data?.user?.role === $Enums.Role.ADMIN ? ADMIN_LINKS : STAFF_LINKS

  return (
    <AdminLayout heading="Admin" backUrl="/">
      <AdminLinks list={links} printProps={[{ name: "name" }]} />
    </AdminLayout>
  )
}

export default AdminPage
