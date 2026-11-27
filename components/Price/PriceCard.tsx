import React from "react"
import Amount, { AmountProps } from "components/UI/Amount"
import { Currency } from "lib/types"
import Link from "next/link"
import { FirstCurrentLastPrices } from "lib/utils"
import DateText from "components/UI/DateText"

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

type PriceItem = {
  label?: string | null
  price?: number
  validUntil?: Date
}

export interface PriceCardProps {
  className?: string
  id: string
  title: string
  description?: string
  options?: string[]
  price?: AmountProps["value"]
  orderedPriceOptions?: FirstCurrentLastPrices<PriceItem>
  priceLabel?: string
  currency?: Currency
  limit?: number
  ticketsSold?: number
  hideButton?: boolean
  buyHref?: string
  highlighted?: boolean
  externalBuyHref?: string
}

const PriceCard: React.FC<PriceCardProps> = (props) => {
  const {
    className,
    id,
    title,
    description,
    options = [],
    price,
    orderedPriceOptions,
    currency,
    limit = 0,
    ticketsSold = 0,
    buyHref,
    hideButton,
    highlighted,
    externalBuyHref,
  } = props

  const ticketsLeft = limit - ticketsSold
  const noLimit = limit === 0

  return (
    <div
      className={`${className ?? ""} rounded-3xl p-8 lg:min-w-80 ${highlighted ? "ring-primary ring-2" : "ring-white/10 ring-1"} lg:p-10 bg-paper/80 text-paper-contrast`}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h3
          id={`tier-${id}`}
          className="text-xl font-semibold leading-8 font-headers"
        >
          {title}
        </h3>
        {highlighted && (
          <p className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold leading-5 text-primary-contrast shrink-0">
            Most popular
          </p>
        )}
      </div>
      <p className="mt-4 leading-6 opacity-80">{description ?? ""}</p>
      {!orderedPriceOptions?.current ? (
        <p className="mt-6 flex items-baseline gap-x-1">
          <span className="text-4xl font-bold tracking-tight font-headers">
            <Amount value={price} currency={currency} />
          </span>
        </p>
      ) : (
        <div className="mt-6">
          <p className="flex items-center text-4xl font-bold tracking-tight">
            <span className="min-w-20 font-headers">
              <Amount
                value={orderedPriceOptions?.current?.price}
                currency={currency}
              />
            </span>
            <span className="ml-4 text-xl">
              {orderedPriceOptions?.current?.label}{" "}
              {orderedPriceOptions?.last && (
                <>
                  (
                  <DateText
                    value={orderedPriceOptions?.current?.validUntil}
                    variant="short-date"
                    prefix="until "
                  />
                  )
                </>
              )}
            </span>
          </p>
          {orderedPriceOptions.last && (
            <p className="mt-3 flex flex items-center text-xl font-bold tracking-tight text-paper-contrast/50">
              <span className="min-w-20 font-bold font-headers">
                <Amount
                  value={orderedPriceOptions?.last?.price}
                  currency={currency}
                />
              </span>
              <span className="ml-4 text-lg">
                {orderedPriceOptions?.last?.label}
              </span>
            </p>
          )}
        </div>
      )}
      {!hideButton && (ticketsLeft > 0 || noLimit) && buyHref && (
        <Link
          href={externalBuyHref || buyHref}
          aria-describedby={`tier-${id}`}
          className={
            "mt-6 font-headers block rounded-md bg-primary text-primary-contrast hover:bg-primary/80 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          }
        >
          Buy
        </Link>
      )}
      {!hideButton && ticketsLeft === 0 && (
        <p className="mt-6 font-headers block py-2 font-semibold leading-6">
          Sold Out
        </p>
      )}
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

export default PriceCard
