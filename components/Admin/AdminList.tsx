import Link from "next/link"
import AdminDeleteButton from "./AdminDeleteButton"
import _get from "lodash/get"
import AdminPostButton from "./AdminPostButton"

type AdminItem = {
  id: string
}

type AdminProp = {
  name: string
  label?: string
  className?: string
}

export type AdminListProps = {
  list?: AdminItem[]
  printProps?: AdminProp[]
  getEditHref?: (id: string, item: AdminItem) => string | undefined
  getDeleteHref?: (id: string, item: AdminItem) => string | undefined
  actions?: ((id: string) => {
    href: string
    label: string
    confirmation?: string
    data?: object
    hidden?: boolean
  })[]
}

const AdminList: React.FC<AdminListProps> = (props) => {
  const {
    list = [],
    printProps = [],
    getEditHref,
    getDeleteHref,
    actions = [],
  } = props

  if (list.length === 0) {
    return <p className="text-center">No data</p>
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700 table-auto">
        <thead>
          <tr>
            {printProps.map((subitem) => (
              <th
                key={subitem.name}
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left font-bold sm:pl-0 text-sm"
              >
                {subitem.label ?? subitem.name}
              </th>
            ))}
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {list.map((item) => (
            <tr key={item.id}>
              {printProps.map((subitem) => {
                const val = _get(item, subitem.name)
                return (
                  <td
                    key={subitem.name}
                    className={`min-w-40 lg:min-w-20 py-4 pl-4 pr-3 font-medium sm:pl-0 ${subitem.className ?? ""}`}
                  >
                    {val && typeof val === "object"
                      ? JSON.stringify(val)
                      : String(val ?? "")}
                  </td>
                )
              })}
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right font-medium sm:pr-0">
                {actions.map((fn) => {
                  const { href, label, confirmation, data, hidden } = fn(
                    item.id
                  )
                  if (!hidden) {
                    return (
                      <AdminPostButton
                        className="ml-2"
                        key={label}
                        action={href}
                        confirmMessage={confirmation}
                        data={data}
                      >
                        {label}
                      </AdminPostButton>
                    )
                  }
                })}
                {getEditHref && getEditHref(item.id, item) && (
                  <Link
                    href={getEditHref(item.id, item) ?? "#"}
                    className="inline-block ml-2 font-headers rounded-md ring-1 ring-inset ring-primary text-primary-contrast hover:bg-primary/80 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Edit
                  </Link>
                )}
                {getDeleteHref && getDeleteHref(item.id, item) && (
                  <AdminDeleteButton
                    className="ml-2"
                    id={item.id}
                    action={getDeleteHref(item.id, item)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminList
