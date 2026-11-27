import Amount, { AmountProps } from "components/UI/Amount"
import { Currency } from "lib/types"
import TicketInfoCard, { TicketInfoCardProps } from "./TicketInfoCard"

const CheckIcon = (
  <svg
    className="h-6 w-5 flex-none"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clipRule="evenodd"
    />
  </svg>
)

export type TicketCardProps = {
  id: string
  title: string
  description?: string
  options?: string[]
  price?: AmountProps["value"]
  totalPrice?: AmountProps["value"]
  currency?: Currency
  highlighted?: boolean
} & TicketInfoCardProps

const TicketCard: React.FC<TicketCardProps> = (props) => {
  const {
    id,
    title,
    description,
    options = [],
    price,
    totalPrice,
    currency,
    highlighted,
    name,
    email,
    merch,
  } = props

  return (
    <div
      className={`rounded-3xl p-8 ${highlighted ? "ring-primary ring-2" : "ring-white/10 ring-1"} lg:p-10 bg-paper/80 text-paper-contrast`}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h3
          id={`tier-${id}`}
          className="text-xl font-semibold leading-8 font-headers"
        >
          {title}
        </h3>
      </div>
      {description && (
        <p className="mt-4 leading-6 opacity-80">{description ?? ""}</p>
      )}
      <div className="mt-4">
        <TicketInfoCard name={name} email={email} merch={merch} />
      </div>
      <p className="mt-6 flex items-baseline gap-x-1">
        {totalPrice && (
          <span className="text-3xl opacity-80 font-bold tracking-tight font-headers line-through mr-4">
            <Amount value={price} currency={currency} />
          </span>
        )}
        <span className="text-4xl font-bold tracking-tight font-headers">
          <Amount value={totalPrice || price} currency={currency} />
        </span>
      </p>
      {options.length > 0 && (
        <ul
          role="list"
          className="mt-8 space-y-3 leading-6 text-gray-300 lg:mt-10"
        >
          {options.map((item, index) => (
            <li key={index} className="flex gap-x-3">
              {CheckIcon}
              <span className="opacity-80">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TicketCard
