import QrScannerModel from "qr-scanner"
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import ErrorMessage from "./ErrorMessage"

export type QRScannerProps = {
  paused?: boolean
  onGetCode?: (data: string) => void
}

const QRScanner: React.FC<QRScannerProps> = (props) => {
  const { paused, onGetCode } = props

  const qrScannerRef = useRef<QrScannerModel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const callbackRef = useRef<((data: string) => void) | null>(onGetCode ?? null)

  const [error, setError] = useState<string | null>(null)

  const start = useCallback(async () => {
    try {
      setError(null)
      await qrScannerRef.current?.start()
    } catch (err) {
      setError(String(err))
    }
  }, [])

  useLayoutEffect(() => {
    if (!videoRef.current) return

    const scanner = new QrScannerModel(
      videoRef.current,
      (result) => {
        if (callbackRef.current) callbackRef.current(result.data)
      },
      {
        highlightScanRegion: true,
        maxScansPerSecond: 2,
      }
    )
    qrScannerRef.current = scanner

    // start()

    return () => {
      scanner.destroy()
    }
  }, [])

  useEffect(() => {
    if (paused) {
      qrScannerRef.current?.stop()
    } else {
      start()
    }
  }, [paused, start])

  useEffect(() => {
    callbackRef.current = onGetCode ?? null
  }, [onGetCode])

  return (
    <div className="relative w-full h-full">
      <video className="w-full h-full" ref={videoRef} />
      {error && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <ErrorMessage message={error} />
          <button
            type="button"
            className="mt-4 inline-block font-headers rounded-md ring-1 ring-inset ring-primary text-primary-contrast hover:bg-primary/20 px-3 py-2 text-center font-semibold disabled:opacity-50 leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={start}
          >
            Restart camera
          </button>
        </div>
      )}
    </div>
  )
}

const QRScannerMemo = memo(QRScanner)

export default QRScannerMemo
