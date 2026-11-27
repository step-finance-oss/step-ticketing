import AdminLayout from "components/Page/AdminLayout"
import { Metadata } from "next"
import AdminList from "components/Admin/AdminList"
import AdminPanel from "components/Admin/AdminPanel"
import { getUsers, User } from "lib/user"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "User list",
  }
}

const getServerSideProps: () => Promise<UsersPageProps> = async () => {
  const events = await getUsers()

  return {
    events,
  }
}

interface UsersPageProps {
  events: User[]
}

const UsersPage = async () => {
  const { events } = await getServerSideProps()

  return (
    <AdminLayout heading="User list" backUrl="/admin">
      <AdminPanel addHref="/admin/users/new" className="mb-4" />
      <AdminList
        list={events}
        printProps={[
          { name: "id" },
          { name: "name" },
          { name: "email" },
          { name: "role" },
        ]}
        getEditHref={(id) => `/admin/users/${id}/edit`}
        getDeleteHref={(id) =>
          `/api/admin/users/${id}?backUrl=${encodeURIComponent("/admin/users")}&errorBackUrl=${encodeURIComponent("/admin/users")}`
        }
      />
    </AdminLayout>
  )
}

export default UsersPage
