import { serve } from "inngest/next"
import { inngest } from "lib/inngest/client"
import {
  resendEmailConfirmationsBatch,
  resendEmailConfirmations,
  waitForOrderAndCompletePurchase,
  sendEmailConfirmation,
  waitForConfirmationAndCreateTicket,
} from "lib/inngest/functions"

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendEmailConfirmation,
    resendEmailConfirmations,
    resendEmailConfirmationsBatch,
    waitForOrderAndCompletePurchase,
    waitForConfirmationAndCreateTicket,
  ],
})
