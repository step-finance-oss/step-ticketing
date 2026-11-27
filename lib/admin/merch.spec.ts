import { NextRequest } from "next/server"
import { beforeEach, expect, it, vi } from "vitest"
import { PUT } from "../../app/api/admin/tickets/[id]/update/route"

const { updateTicket } = vi.hoisted(() => ({ updateTicket: vi.fn() }))
vi.mock("lib/ticket", () => ({ updateTicket }))

function update(body: object) {
  const request = new NextRequest("http://localhost", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return PUT(request, { params: Promise.resolve({ id: "ticket" }) })
}

beforeEach(() => {
  updateTicket.mockReset()
})

it("saves the guest desk's merchandise selection", async () => {
  const data = { selectedMerchOptions: { shirt: { size: "M" } } }
  updateTicket.mockResolvedValue({ id: "ticket" })
  expect((await update(data)).status).toBe(200)
  expect(updateTicket).toHaveBeenCalledWith("ticket", data)
})

it("rejects unrelated ticket fields and malformed selections", async () => {
  expect(
    (await update({ selectedMerchOptions: {}, notes: "new note" })).status
  ).toBe(400)
  expect((await update({ selectedMerchOptions: { shirt: 1 } })).status).toBe(
    400
  )
  expect(updateTicket).not.toHaveBeenCalled()
})
