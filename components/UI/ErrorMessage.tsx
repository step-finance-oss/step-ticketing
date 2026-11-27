import React from "react"

export type ErrorMessageProps = {
  className?: string
  message?: string | React.ReactNode
}

const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
  const { className, message } = props

  if (!message) return null

  return (
    <div className={`${className ?? ""} rounded-md bg-red-800/20 px-3 py-2`}>
      <p className="text-red-600">{message}</p>
    </div>
  )
}

export default ErrorMessage
