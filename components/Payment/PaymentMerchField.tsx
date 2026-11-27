export type PaymentMerchOptions = {
  [label: string]: { [variant: string]: string[] }
}

export type PaymentMerchValue = {
  [label: string]: { [variant: string]: string } | undefined
}

interface PaymentMerchFieldProps {
  defaultValue?: PaymentMerchValue
  merchOptions?: PaymentMerchOptions
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

const PaymentMerchField: React.FC<PaymentMerchFieldProps> = (props) => {
  const { merchOptions = {}, defaultValue, onChange } = props

  return (
    <>
      {Object.keys(merchOptions).map((key) => (
        <div key={key}>
          <label htmlFor="merch" className="block font-medium leading-6">
            {key}
          </label>
          <div className="flex mt-2 gap-6">
            {Object.keys(merchOptions[key]).map((variant) => (
              <select
                id="merch"
                name="merch"
                className="flex-1 block w-full rounded-md border-0 py-2 px-3 pr-10 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 focus:ring-2 focus:text-page-contrast sm:leading-6"
                onChange={onChange}
                required
                aria-label={variant}
                key={variant}
                defaultValue={defaultValue?.[key]?.[variant]}
              >
                <option value="" hidden>{variant}</option>
                {merchOptions[key][variant].map((option) => (
                  <option key={option} value={`${key}.${variant}.${option}`}>
                    {option}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default PaymentMerchField
