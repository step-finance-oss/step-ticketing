export type DateTextProps = {
  value?: Date | string
  emptyValue?: string
  variant?: "datetime" | "date" | "short-date"
  prefix?: React.ReactNode
}

const DateText: React.FC<DateTextProps> = (props) => {
  const { value, emptyValue = null, variant, prefix } = props

  let normalizedValue = value

  if (!normalizedValue) return emptyValue ? <>{emptyValue}</> : null

  if (typeof normalizedValue === "string")
    normalizedValue = new Date(normalizedValue)

  switch (variant) {
    case "date":
      return (
        <>
          {prefix}
          {normalizedValue.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })}
        </>
      )

    case "short-date":
      return (
        <>
          {prefix}
          {normalizedValue.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </>
      )

    default:
      return (
        <>
          {prefix}
          {normalizedValue.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </>
      )
  }
}

export default DateText
