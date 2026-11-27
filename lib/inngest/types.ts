import { ResendEmailConfirmations } from "lib/mail/types"
import { InitiatePurchaseResponse } from "../kado/types"

export type SendEmailConfirmation = {
  data: { ticketId: string; force: boolean }
}

export type ResendEmailConfirmationData = {
  data: ResendEmailConfirmations
}

export type ResendEmailConfirmationBatchData = {
  data: { ticketIds: string[]; batchNumber: number }
}

export type KadoWaitForOrderAndCompletePurchase = {
  data: InitiatePurchaseResponse
}
