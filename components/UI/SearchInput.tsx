import React, { useMemo } from "react"
import throttle from "lodash/throttle"

const DEFAULT_THROTTLE_WAIT = 300

const SearchIcon = (
  <svg className="w-4 h-4 text-page-contrast" viewBox="0 0 14 14" fill="none">
    <path
      d="M13 13L9.53537 9.53537M9.53537 9.53537C10.4731 8.59765 10.9999 7.32583 10.9999 5.9997C10.9999 4.67357 10.4731 3.40175 9.53537 2.46403C8.59765 1.52632 7.32583 0.999512 5.9997 0.999512C4.67357 0.999512 3.40175 1.52632 2.46403 2.46403C1.52632 3.40175 0.999512 4.67357 0.999512 5.9997C0.999512 7.32583 1.52632 8.59765 2.46403 9.53537C3.40175 10.4731 4.67357 10.9999 5.9997 10.9999C7.32583 10.9999 8.59765 10.4731 9.53537 9.53537Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export type SearchInputProps = {
  defaultValue?: string
  throttleWait?: number
  onChange?: (value: string) => void
}

const SearchInput: React.FC<SearchInputProps> = (props) => {
  const { defaultValue, throttleWait = DEFAULT_THROTTLE_WAIT, onChange } = props

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = useMemo(
    () =>
      throttle(
        (event) => {
          if (onChange) onChange(event.target.value)
        },
        throttleWait,
        { leading: false }
      ),
    [throttleWait, onChange]
  )

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {SearchIcon}
      </div>
      <input
        id="search"
        name="search"
        type="text"
        className="pl-10 block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
        onChange={handleChange}
        defaultValue={defaultValue}
      />
    </div>
  )
}

export default SearchInput
