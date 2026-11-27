import Papa from "papaparse"

type JSONRecord<T> = Record<keyof T, T>

export const contentType = "text/csv;charset=utf-8;"

export function JSONFormatter<T>(records: JSONRecord<T>[]) {
  function convertNestedObjectToString(record: JSONRecord<T>) {
    const result = { ...record }
    const keys = Object.keys(record)

    keys.forEach((key) => {
      const value = record[key]
      if (typeof value === "object" && value != null) {
        result[key] = JSON.stringify(value)
      }
    })

    return result
  }

  return records.map(convertNestedObjectToString)
}

export async function writeCSVFromRecords<T>(
  records: JSONRecord<T>[],
  formatter = JSONFormatter,
  formatterOptions = { newline: "\r\n" }
) {
  const formattedData = formatter(records)
  const body = Papa.unparse(formattedData, formatterOptions)

  return body
}
