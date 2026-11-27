import { Currency } from "lib/types"

export type AmountProps = {
  value?: number
  currency?: Currency
}

const Amount: React.FC<AmountProps> = (props) => {
  const { value, currency } = props

  switch (currency) {
    case "USD":
      return <>${value}</>
    default:
      return <>{value}</>
  }
}

export default Amount
