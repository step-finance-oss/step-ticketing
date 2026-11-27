import Link from "next/link"

type GuestProps = {
  id: string
  name?: string
  email?: string
  href: string
  checkedIn?: boolean
}

export type GuestListProps = {
  list?: GuestProps[]
  onCardClick?: (event: React.MouseEvent, id: GuestProps["id"]) => void
}

const GuestList: React.FC<GuestListProps> = (props) => {
  const { list = [], onCardClick } = props

  return (
    <ul role="list" className="divide-y divide-page-contrast/20">
      {list.map((guest) => (
        <li
          key={guest.id}
          className="flex justify-between gap-x-2 py-5 relative"
        >
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <Link
                href={guest.href}
                className="block"
                onClick={(event) => onCardClick && onCardClick(event, guest.id)}
              >
                <p className="font-bold">{guest.name}</p>
                <p className="mt-1 truncate opacity-60">{guest.email}</p>
                <span className="absolute inset-0" />
              </Link>
            </div>
          </div>
          {guest.checkedIn && (
            <div className="shrink-0">
              <div className="flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 text-primary/80 ring-primary/80 bg-primary-contrast/5">
                Checked-in
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default GuestList
