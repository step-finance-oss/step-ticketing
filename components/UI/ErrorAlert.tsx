const CloseIcon = (
  <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none">
    <path
      d="M1 13L13 1M1 1L13 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export type ErrorAlertProps = {
  className?: string
  message?: React.ReactNode
  onClose?: () => void
}

const ErrorAlert: React.FC<ErrorAlertProps> = (props) => {
  const { className, message, onClose } = props

  return (
    <div
      className={`fixed inset-0 bg-page/50 text-primary-contrast ${className ?? ""}`}
    >
      <div
        role="status"
        className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 "
      >
        <button
          className="absolute top-2 right-2 bg-none text-page-contrast/50 rounded-full p-3 inline-flex items-center justify-center hover:text-page-contrast/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          {CloseIcon}
        </button>

        <div className="rounded-3xl ring-page ring-1  bg-page">
          <div className="rounded-3xl p-8 lg:min-w-80 ring-white/10 ring-1 lg:p-10  bg-red-800/20  text-red-600">
            <p className="text-center mt-4">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorAlert
