export type AdminFormFieldProps = {
  type:
    | "text"
    | "number"
    | "date"
    | "boolean"
    | "password"
    | "email"
    | "tel"
    | "select"
  name: string
  emailSentDateTime?: Date
  label?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: string | number | boolean | Date | null
  options?: { value: string | number | boolean | Date | null; label: string }[]
}

const AdminFormField: React.FC<AdminFormFieldProps> = (props) => {
  const { type, name, label, required, defaultValue, disabled, options } = props

  switch (type) {
    case "text":
    case "number":
    case "password":
    case "email":
    case "tel":
      return (
        <div>
          <label htmlFor={name} className="block font-medium leading-6">
            {label ?? name}
          </label>
          <div className="mt-2">
            <input
              type={type}
              name={name}
              id={name}
              className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
              required={required}
              disabled={disabled}
              defaultValue={defaultValue ? String(defaultValue) : undefined}
            />
          </div>
        </div>
      )

    case "date":
      return (
        <div>
          <label htmlFor={name} className="block font-medium leading-6">
            {label ?? name}
          </label>
          <div className="mt-2">
            <input
              type="datetime-local"
              name={name}
              id={name}
              className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
              required={required}
              disabled={disabled}
              defaultValue={
                !defaultValue
                  ? undefined
                  : defaultValue instanceof Date
                    ? defaultValue.toISOString().slice(0, 16) // We need this format here `YYYY-MM-DDThh:mm`
                    : typeof defaultValue === "string"
                      ? new Date(defaultValue).toISOString().slice(0, 16) // We need this format here `YYYY-MM-DDThh:mm`
                      : undefined
              }
            />
          </div>
        </div>
      )

    case "boolean":
      return (
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              value={1}
              className="h-4 w-4 bg-page-contrast rounded border-page text-primary focus:ring-inset"
              defaultChecked={Boolean(defaultValue)}
              disabled={disabled}
              required={required}
            />
          </div>
          <div className="ml-2">
            <label htmlFor={name} className="font-medium">
              {label ?? name}
            </label>
          </div>
        </div>
      )

    case "select":
      return (
        <div>
          <label htmlFor={name} className="block font-medium leading-6">
            {label ?? name}
          </label>
          <div className="mt-2">
            <select
              name={name}
              id={name}
              className="flex-1 block w-full rounded-md border-0 py-2 px-3 pr-10 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 focus:ring-2 focus:text-page-contrast sm:leading-6"
              defaultValue={defaultValue ? String(defaultValue) : undefined}
              required={required}
              disabled={disabled}
            >
              <option hidden></option>
              {options?.map((option) => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )

    default:
      return null
  }
}

export default AdminFormField
