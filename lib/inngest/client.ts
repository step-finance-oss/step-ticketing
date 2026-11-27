import { EventSchemas, Inngest } from "inngest"
import {
  KadoWaitForOrderAndCompletePurchase,
  ResendEmailConfirmationData,
  ResendEmailConfirmationBatchData,
  SendEmailConfirmation,
} from "./types"

type Events = {
  "email/send-one": SendEmailConfirmation
  "email/send-multiple": ResendEmailConfirmationData
  "email/resend-confirmations-batch": ResendEmailConfirmationBatchData
  "kado/wait-for-order-and-complete-purchase": KadoWaitForOrderAndCompletePurchase
}

export const inngest = new Inngest({
  id: "step-ticketing",
  chemas: new EventSchemas().fromRecord<Events>(),
})
