import { Purchase, Prisma } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { $Enums } from "../prisma"

export const purchaseFactory: (
  amount: number,
  tx: string,
  nonce: string,
  kadoOrderId: string,
  status: $Enums.PurchaseStatus,
  data?: Prisma.JsonValue,
  txId?: string
) => Purchase = (amount, tx, nonce, kadoOrderId, status, data) => {
  return {
    id: uuidv4().toString(),
    nonce: nonce,
    amount: BigInt(amount),
    tx: tx,
    kadoOrderId: kadoOrderId,
    status: status ?? $Enums.PurchaseStatus.PENDING,
    data: data ?? {
      email: "test@test.com",
      name: "test",
      merchOptions: { tShirt: { size: "XXL" } },
    },
    updatedAt: null,
    txId: "",
  }
}
