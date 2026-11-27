"use client"

export type AdminDeleteButtonProps = {
  className?: string
  id?: string
  action?: string
}

const AdminDeleteButton: React.FC<AdminDeleteButtonProps> = (props) => {
  const { id, action, className } = props

  return (
    <form
      className={`${className ?? ""} inline-block`}
      action={action}
      method="POST"
      onSubmit={(event) => {
        if (!confirm(`Do you really want to delete #${id}?`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" value="DELETE" name="_method" />
      <button
        type="submit"
        className="inline-block font-headers rounded-md ring-1 ring-inset ring-red-800 text-primary-contrast hover:bg-red-800/20 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Delete
      </button>
    </form>
  )
}

export default AdminDeleteButton
