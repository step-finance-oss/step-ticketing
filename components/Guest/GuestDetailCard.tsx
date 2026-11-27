import Amount from "components/UI/Amount"
import DateText from "components/UI/DateText"
import { Currency } from "lib/types"
import React from "react"

const EditIcon = (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path
      fill="currentColor"
      d="M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z"
    ></path>
  </svg>
)

const LOW_PRICE_THRESHOLD = Number(process.env.LOW_PRICE_THRESHOLD) || 40

export type GuestDetailCardProps = {
  name?: string
  email?: string
  merch?: { [label: string]: { [variant: string]: string } | undefined }
  promoCode?: string
  size?: string
  checkedInAt?: Date
  ticketName?: string
  ticketPrice: number
  ticketCurrency?: Currency
  onCheckIn?: () => void
  onCheckOut?: () => void
  onEditMerch?: () => void
  notes?: string
}

const GuestDetailCard: React.FC<GuestDetailCardProps> = (props) => {
  const {
    name,
    email,
    merch = {},
    promoCode,
    ticketName,
    ticketPrice,
    ticketCurrency,
    checkedInAt,
    onCheckIn,
    onCheckOut,
    onEditMerch,
    size,
    notes,
  } = props

  return (
    <div>
      <p className="font-bold">{name}</p>
      <p className="mt-2 opacity-60">{email}</p>
      <p className="mt-2">Ticket: {ticketName} </p>
      <div className="flex items-center justify-between">
        <p className="mt-2">
          Price: <Amount value={ticketPrice} currency={ticketCurrency} />
        </p>
        {ticketPrice > 1 && ticketPrice <= LOW_PRICE_THRESHOLD && (
          <p className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold leading-5 text-primary-contrast shrink-0">
            Low price
          </p>
        )}
      </div>
      <div className="flex items-start">
        <div className="grow">
          {Object.keys(merch).map((key) => (
            <p className="mt-2" key={key}>
              {key}:{" "}
              {merch[key] &&
                Object.keys(merch[key] ?? {}).map(
                  (variant) =>
                    `${variant} - ${merch[key]?.[variant]?.toUpperCase()} `
                )}
            </p>
          ))}
          {Object.keys(merch).length === 0 ? (
            <p className="mt-2">Shirt size: {size}</p>
          ) : undefined}
        </div>
        <button
          className="shrim-0 bg-primary-contrast/10 text-primary-contrast rounded-full p-1 ml-6 mt-1 -mb-1 inline-flex items-center justify-center hover:bg-primary-contrast/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onEditMerch}
          aria-label="Edit"
        >
          {EditIcon}
        </button>
      </div>
      {promoCode && <p className="mt-2">Promocode: {promoCode}</p>}
      {notes && <p className="mt-2">Notes: {notes}</p>}
      <p className="mt-2">
        Checked-in: <DateText value={checkedInAt} emptyValue="-" />
      </p>
      {checkedInAt ? (
        <p className="mt-6">
          <button
            type="button"
            className="w-full font-headers block rounded-md cursor-pointer bg-primary-contrast/10 text-primary-contrast disabled:bg-primary-contrast/10 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary-contrast/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onCheckOut}
          >
            Cancel check-in
          </button>
        </p>
      ) : (
        <p className="mt-6">
          <button
            type="button"
            className="w-full font-headers block rounded-md cursor-pointer bg-primary text-primary-contrast disabled:bg-primary/40 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={onCheckIn}
          >
            Check-in
          </button>
        </p>
      )}
    </div>
  )
}

export default GuestDetailCard
