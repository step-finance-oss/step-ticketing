import { sendMail } from "lib/send-mail"
import { updateTicket } from "lib/ticket"
import { theme } from "tailwind.config"
import QRCode from "qrcode"
import { render as renderPaymentConfirmation } from "./templates/payment-confirmation"
import { MerchOptions } from "../purchase/types"
import { EMAIL_CONFIRMATION_RESEND_INTERVAL } from "./types"
import prisma from "lib/prisma"
import { v4 as uuidv4 } from "uuid"

export type SendPaymentConfirmationMailParams = {
  ticketId: string
  force?: boolean
}

export const sendPaymentConfirmationMail: (
  data: SendPaymentConfirmationMailParams
) => Promise<boolean> = async ({ ticketId, force }) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      user: { select: { name: true, email: true } },
      qrCode: true,
      selectedMerchOptions: true,
      eventId: true,
      emailSent: true,
      emailSentDateTime: true,
    },
  })
  if (!ticket) {
    return false
  }
  const { name, email } = ticket.user
  if (!email) throw new Error("No email address")
  const forceSend = force === undefined ? false : force
  if (ticket?.emailSent && !forceSend)
    throw new Error("Email sent and no force option used")
  if (
    ticket.emailSentDateTime &&
    Date.now() - ticket.emailSentDateTime.getTime() <
      EMAIL_CONFIRMATION_RESEND_INTERVAL
  ) {
    return false
  }

  const merch = ticket.selectedMerchOptions as MerchOptions

  let qrCode = ticket.qrCode

  if (!qrCode) {
    qrCode = uuidv4()

    await updateTicket(ticketId, {
      qrCode,
    })
  }

  const qr = await QRCode.toDataURL(
    `${process.env.NEXTAUTH_URL ?? ""}/admin/p/${ticket.eventId}/guests?qrCode=${qrCode}`
  )

  const response = await sendMail({
    sendTo: email,
    subject: "Thanks for your purchase!",
    html: renderPaymentConfirmation({
      name: name || "",
      email,
      merch,
      backgroundColor: theme?.extend?.colors?.["page"],
      pageContrastColor: theme?.extend?.colors?.["page-contrast"],
      pagePrimaryColor: theme?.extend?.colors?.["primary"],
      supportEmail: process.env.SUPPORT_EMAIL,
    }),
    attachments: [
      {
        filename: "qrCode.png",
        cid: "ticketimage",
        content: qr.split("base64,")[1],
        encoding: "base64",
      },
    ],
  })
  console.log(`Sent email to ${email}`)

  await updateTicket(ticket.id, {
    emailSent: true,
    emailSentDateTime: new Date(),
  })

  return Boolean(response)
}
