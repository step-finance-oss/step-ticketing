"use client"

import PaymentMerchField, {
  PaymentMerchOptions,
  PaymentMerchValue,
} from "components/Payment/PaymentMerchField"
import { useCallback, useRef } from "react"
import _set from "lodash/set"

export type GuestMerchFormProps = {
  merch?: PaymentMerchValue
  merchOptions?: PaymentMerchOptions
  onSave?: (value: { merch: PaymentMerchValue }) => void
  onCancel?: () => void
}

const GuestMerchForm: React.FC<GuestMerchFormProps> = (props) => {
  const { merchOptions = {}, merch, onSave, onCancel } = props

  const formRef = useRef(null)

  const handleSave = useCallback(() => {
    if (onSave && formRef.current) {
      const formData = new FormData(formRef.current)
      const merchArr = Array.isArray(formData.getAll("merch"))
        ? formData.getAll("merch").map(String)
        : []
      let merch = {}
      merchArr.forEach((val) => {
        const valArr = val.split(".")
        merch = _set(merch, valArr.slice(0, -1), valArr.slice(-1)[0])
      })
      onSave({ merch })
    }
  }, [onSave])

  return (
    <form ref={formRef} onSubmit={(event) => event.preventDefault()}>
      <PaymentMerchField merchOptions={merchOptions} defaultValue={merch} />
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          className="w-full font-headers block rounded-md cursor-pointer bg-primary text-primary-contrast disabled:bg-primary/40 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="w-full font-headers block rounded-md cursor-pointer bg-primary-contrast/10 text-primary-contrast disabled:bg-primary-contrast/10 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary-contrast/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default GuestMerchForm
