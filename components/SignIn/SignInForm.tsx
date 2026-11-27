import { useCallback, useState } from "react"
import ErrorMessage from "components/UI/ErrorMessage"

export type SignInFormValues = {
  email: string
  password: string
}

export interface SignInFormProps {
  onSubmit?: (values: SignInFormValues) => Promise<{ error: string } | void>
}

const SignInForm: React.FC<SignInFormProps> = (props) => {
  const { onSubmit } = props

  const [error, setError] = useState<string | null>(null)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault()

      const formData = new FormData(event.target as HTMLFormElement)

      if (onSubmit) {
        const res = await onSubmit({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        })

        if (res?.error) {
          setError(res.error)
        }
      }
    },
    [onSubmit]
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
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
              required
              autoComplete="username"
              onChange={() => setError(null)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block font-medium leading-6">
            Password
          </label>
          <div className="mt-2">
            <input
              type="password"
              name="password"
              id="password"
              className="block w-full rounded-md border-0 py-2 px-3 text-page-contrast bg-page-contrast/5 ring-1 ring-inset ring-page-contrast/10 placeholder:text-page-contrast/50 focus:ring-2 focus:ring-inset sm:leading-6"
              required
              autoComplete="current-password"
              onChange={() => setError(null)}
            />
          </div>
        </div>
      </div>
      {error && <ErrorMessage className="mt-12" message={error} />}
      <div className="mt-12">
        <button
          type="submit"
          className="w-full mt-6 font-headers block rounded-md cursor-pointer bg-primary text-primary-contrast disabled:bg-primary/40 disabled:text-primary-contrast/40 px-3 py-2 text-center font-semibold leading-6 hover:bg-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Sign in
        </button>
      </div>
    </form>
  )
}

export default SignInForm
