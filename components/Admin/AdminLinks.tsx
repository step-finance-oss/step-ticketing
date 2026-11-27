import Link from "next/link"

type AdminItem = {
  id: string
  href: string
}

type AdminProp = {
  name: string
}

export type AdminLinksProps = {
  list?: AdminItem[]
  printProps?: AdminProp[]
}

const AdminLinks: React.FC<AdminLinksProps> = (props) => {
  const { list = [], printProps = [] } = props

  return (
    <ul role="list" className="divide-y divide-page-contrast/20">
      {list.map((item, index) => (
        <li key={item.id ?? index} className="relative">
          <Link href={item.href} className="block">
            <div className="relative py-5  flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                {printProps.map((subitem) => (
                  <p key={subitem.name}>{String(item[subitem.name])}</p>
                ))}
                <span className="absolute inset-0" />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default AdminLinks
