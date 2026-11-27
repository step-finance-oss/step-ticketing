import { useMemo } from "react"
import throttle from "lodash/throttle"
import PromoCodeInput from "components/UI/PromoCodeInput"
import PaymentMerchField, { PaymentMerchOptions } from "./PaymentMerchField"

export type PaymentFormValues = {
  name: string
  email: string
  merch: {
    [label: string]: { [variant: string]: string }
  }
  promocode?: string
}

interface PaymentFormProps {
  merchOptions?: PaymentMerchOptions
  onChange?: (name: string, value: string) => void
}

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const { merchOptions = {}, onChange } = props

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = useMemo(
    () =>
      throttle((event) => {
        if (onChange) onChange(event.target.name, event.target.value)
      }, 300),
    [onChange]
  )

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="name" className="block font-medium leading-6">
          Name
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="name"
            id="name"
            className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block font-medium leading-6">
          Email
        </label>
        <div className="mt-2">
          <input
            type="email"
            name="email"
            id="email"
            className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <PaymentMerchField merchOptions={merchOptions} onChange={handleChange} />
      <PromoCodeInput onChange={handleChange} />
    </div>
  )
}

export default PaymentForm
