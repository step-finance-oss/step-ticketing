import { test, expect } from "vitest"
import { JSONFormatter, writeCSVFromRecords } from "./index"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Entity = { [key: string]: any }

test("should generate CSV string from list of records", async () => {
  const records: Entity[] = [
    { id: "a", name: "b", data: 0 },
    { id: "b", name: "d", data: "1" },
    { id: "e", name: "f", data: { text: "text" } },
    { id: "g", name: "h", data: true },
  ]

  expect(
    await writeCSVFromRecords<Entity>(records, JSONFormatter, { newline: "\n" })
  ).toBe(`id,name,data
a,b,0
b,d,1
e,f,"{""text"":""text""}"
g,h,true`)
})
