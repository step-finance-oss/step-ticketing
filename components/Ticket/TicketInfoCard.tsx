const TicketIcon: React.FC = () => (
  <svg
    className="h-10 w-10 lg:h-12 lg:w-12"
    fill="none"
    aria-hidden="true"
    data-slot="icon"
    viewBox="0 0 49 49"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M33.5 12.5V14m0 6v1.5m0 6V29m0 6v1.5M15.5 26H26m-10.5 4.5h6M7.25 11A2.25 2.25 0 0 0 5 13.25v6.052a5.998 5.998 0 0 1 0 10.396v6.052A2.25 2.25 0 0 0 7.25 38h34.5A2.25 2.25 0 0 0 44 35.75v-6.052a5.998 5.998 0 0 1 0-10.396V13.25A2.25 2.25 0 0 0 41.75 11H7.25Z"
    />
  </svg>
)

export type TicketInfoCardProps = {
  name?: string
  email?: string
  merch?: {
    [label: string]: { [variant: string]: string }
  }
}

const TicketInfoCard: React.FC<TicketInfoCardProps> = (props) => {
  const { name, email, merch = {} } = props

  return (
    <div className="relative flex items-center rounded-xl bg-paper px-4 lg:px-6 py-4">
      <div className="flex-shrink-0 text-primary">
        <TicketIcon />
      </div>
      <div className="min-w-0 flex-1 pl-4 ml-4 lg:ml-6 lg:pl-6 border-paper-contrast/10 border-l-2">
        <span aria-hidden="true" className="absolute inset-0" />
        <p className="font-medium opacity-80">{name}</p>
        <p className="truncate opacity-80">{email}</p>
        {Object.keys(merch).map((key) => (
          <p className="truncate opacity-80" key={key}>
            {key}:{" "}
            {Object.keys(merch[key]).map(
              (variant) => `${variant} - ${merch[key][variant]?.toUpperCase()} `
            )}
          </p>
        ))}
      </div>
    </div>
  )
}

export default TicketInfoCard
