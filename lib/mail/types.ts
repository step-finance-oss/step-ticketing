import { TimeStr } from "inngest/types"

// milliseconds to days, 1 hour by default
export const EMAIL_CONFIRMATION_RESEND_INTERVAL =
  1000 * 60 * 60 * (Number(process.env.EMAIL_CONFIRMATION_RESEND_INTERVAL) || 1)
export const EMAIL_CONFIRMATION_BATCH_SIZE =
  Number(process.env.EMAIL_CONFIRMATION_BATCH_SIZE) || 10

// https://www.inngest.com/docs/guides/throttling#configuration-reference
export const EMAIL_CONFIRMATION_THROTTLE_LIMIT =
  Number(process.env.EMAIL_CONFIRMATION_THROTTLE_LIMIT) || 2
export const EMAIL_CONFIRMATION_THROTTLE_PERIOD: TimeStr =
  (process.env.EMAIL_CONFIRMATION_THROTTLE_PERIOD as TimeStr) || "1m"

export type ResendEmailConfirmations = {
  ticketIds: string[] | string
  eventId: string
  resendAll: string
}
