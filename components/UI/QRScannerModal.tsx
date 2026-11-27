import { useCallback } from "react"
import QRScanner from "./QRScanner"

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

export type QRScannerModalProps = {
  open?: boolean
  paused?: boolean
  onClose?: () => void
  onGetCode?: (data: string) => void
}

const QRScannerModal: React.FC<QRScannerModalProps> = (props) => {
  const { open = false, onClose, onGetCode } = props

  const handleGetCode: (data: string) => void = useCallback(
    (data) => {
      if (onGetCode) onGetCode(data)
    },
    [onGetCode]
  )

  // if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-page z-20"
      aria-label="Modal"
      style={open ? undefined : { display: "none" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <QRScanner key="scanner" paused={!open} onGetCode={handleGetCode} />
      </div>
      <button
        className="absolute top-4 right-4 bg-page-contrast text-page/50 rounded-full p-3 inline-flex items-center justify-center hover:bg-page-contrast/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        {CloseIcon}
      </button>
    </div>
  )
}

export default QRScannerModal
