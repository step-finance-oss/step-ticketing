import React from "react"
import PriceCard, { PriceCardProps } from "./PriceCard"

export type PriceTiersProps = {
  list?: PriceCardProps[]
}

const PriceTiers: React.FC<PriceTiersProps> = (props) => {
  const { list } = props

  if (!list || list.length === 0) {
    return (
      <p className="py-20 mx-auto max-w-2xl text-center lg:max-w-4xl">
        No available
      </p>
    )
  }

  return (
    <div className="isolate px-4 pb-20 mx-auto gap-8 flex flex-wrap flex-col lg:flex-row items-center lg:items-stretch justify-center">
      {list.map((item, index) => (
        <PriceCard className="w-96 max-w-full" key={index} {...item} />
      ))}
    </div>
  )
}

export default PriceTiers
