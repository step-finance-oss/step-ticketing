import AdminLayout from "components/Page/AdminLayout"
import { getPurchases } from "lib/purchase/server"
import { Metadata } from "next"
import AdminList from "components/Admin/AdminList"
import Search from "./components/Search"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Purchases list",
  }
}

export const dynamic = "force-dynamic"

const PurchasesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) => {
  const { query } = await searchParams
  const purchases = await getPurchases({ query })

  return (
    <AdminLayout heading="Purchases list" backUrl="/admin">
      <div className="flex justify-end">
        <Search query={query} />
      </div>
      <AdminList
        list={purchases}
        printProps={[
          { name: "id" },
          { name: "nonce", className: "whitespace-nowrap" },
          { name: "status" },
          { name: "ticket.id" },
          { name: "kadoOrderId" },
          { name: "amount" },
          { name: "data" },
        ]}
        actions={[
          (id) => {
            const purchase = purchases.find((item) => item.id === id)
            return {
              label: "Restart Kado order polling",
              href: "/api/kado/initiate-order-polling",
              data: {
                nonce: purchase?.nonce,
                orderId: purchase?.kadoOrderId,
              },
              hidden: !purchase?.kadoOrderId,
            }
          },
        ]}
      />
    </AdminLayout>
  )
}

export default PurchasesPage
