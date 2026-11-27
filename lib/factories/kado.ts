import { GetOrderStatusResponse } from "../kado/types"

export const kadoOrderStatusResponseFactory: (
  success: boolean,
  transferStatus: "uninitiated" | "pending" | "failed" | "settled" | "unknown",
  paymentStatus: "success" | "failed",
  amount: number
) => GetOrderStatusResponse = (
  success,
  transferStatus,
  paymentStatus,
  amount
) => {
  return {
    success: success,
    data: {
      recvAmount: {
        amount: amount,
        unit: "USDC",
      },
      paymentStatus: paymentStatus,
      transferStatus: transferStatus,
      txHash: "hash_hash",
      walletAddress: "target_wallet_address",
      sendTo: "target_wallet",
      humanStatusField: "",
    },
  }
}
