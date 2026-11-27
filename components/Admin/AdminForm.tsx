import ErrorMessage from "components/UI/ErrorMessage"
import AdminFormField, { AdminFormFieldProps } from "./AdminFormField"

const SUPPORTED_METHODS = ["GET", "POST"]

export type AdminFormProps = {
  action: string
  method: string
  fields?: AdminFormFieldProps[]
  buttonText: string
  error?: string | React.ReactNode
  defaultValues?: { [key: string]: AdminFormFieldProps["defaultValue"] }
  hiddenValues?: { [key: string]: AdminFormFieldProps["defaultValue"] }
}

const AdminForm: React.FC<AdminFormProps> = (props) => {
  const {
    action,
    method,
    fields = [],
    buttonText,
    error,
    defaultValues,
    hiddenValues,
  } = props

  const unsupportedMethod = SUPPORTED_METHODS.includes(method.toUpperCase())
    ? undefined
    : method

  return (
    <form
      action={action}
      method={unsupportedMethod ? "POST" : method.toUpperCase()}
    >
      {unsupportedMethod && (
        <input type="hidden" value={unsupportedMethod} name="_method" />
      )}
      {hiddenValues &&
        Object.keys(hiddenValues).map((key) => (
          <input
            key={key}
            type="hidden"
            value={String(hiddenValues[key] ?? "")}
            name={key}
          />
        ))}
      <div className="space-y-8">
        {fields.map((item) => (
          <AdminFormField
            key={item.name}
            {...item}
            defaultValue={defaultValues?.[item.name]}
          />
        ))}
      </div>
      {typeof error === "string" ? (
        <ErrorMessage className="mt-8" message={error} />
      ) : (
        error
      )}
      <div className="mt-8">
        <button
          type="submit"
          className="font-headers rounded-md bg-primary text-primary-contrast hover:bg-primary/80 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}

export default AdminForm
