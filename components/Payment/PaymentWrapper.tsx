import Link from "next/link"

export interface PaymentWrapperProps {
  left?: React.ReactNode
  right?: React.ReactNode
  backHref?: string
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = (props) => {
  const { left, right, backHref } = props

  return (
    <div className="isolate px-4 pb-20 mx-auto max-w-md lg:max-w-7xl">
      {backHref && (
        <div className="flex flex-col lg:flex-row items-center justify-center lg:gap-16">
          <div className="max-w-md w-full">
            <div className="mb-4">
              <Link
                href={backHref}
                className="block font-headers rounded-md px-3 py-2 text-center font-semibold leading-6 hover:text-paper-contrast/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                ← Back to ticket selection
              </Link>
            </div>
          </div>
          {right && <div className="max-w-xl w-full"></div>}
        </div>
      )}
      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-center gap-16">
        <div className="max-w-md w-full">{left}</div>
        {right && <div className="max-w-xl w-full">{right}</div>}
      </div>
    </div>
  )
}

export default PaymentWrapper
