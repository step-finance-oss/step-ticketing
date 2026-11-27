import Link from "next/link"

export type AdminPanelProps = {
  className?: string
  addHref?: string
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const { className, addHref } = props

  return (
    <div className={className}>
      {addHref && (
        <Link
          href={addHref}
          className="inline-block font-headers rounded-md bg-primary text-primary-contrast hover:bg-primary/80 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Add
        </Link>
      )}
    </div>
  )
}

export default AdminPanel
