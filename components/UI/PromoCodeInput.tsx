import { useState } from "react"

interface PromoCodeInputProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = (props) => {
  const { onChange } = props

  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div>
        <label htmlFor="promocode" className="block font-medium leading-6">
          Promo code
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="promocode"
            id="promocode"
            className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
            onChange={onChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <a
        href="#"
        className="font-medium text-primary hover:underline"
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        Apply promo code
      </a>
    </div>
  )
}

export default PromoCodeInput
