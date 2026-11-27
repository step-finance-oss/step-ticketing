import nodemailer from "nodemailer"
import Mail from "nodemailer/lib/mailer"

const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST
const SMTP_SERVER_USER = process.env.SMTP_SERVER_USER
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD
const SENDER_EMAIL = process.env.SENDER_EMAIL
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL

const transporter = nodemailer.createTransport({
  host: SMTP_SERVER_HOST ?? "",
  port: Number(process.env.SMTP_SERVER_PORT || 587),
  secure: process.env.SMTP_SERVER_PORT === "465",
  auth: SMTP_SERVER_USER
    ? { user: SMTP_SERVER_USER, pass: SMTP_SERVER_PASSWORD }
    : undefined,
})

export async function sendMail({
  sendTo,
  subject,
  text,
  html,
  attachments,
}: {
  sendTo?: string
  subject: string
  text?: string
  html?: string
  attachments?: Mail.Options["attachments"]
}) {
  await transporter.verify()
  const info = await transporter.sendMail({
    from: SENDER_EMAIL,
    to: sendTo,
    cc: SUPPORT_EMAIL,
    subject: subject,
    text: text,
    html: html ? html : "",
    attachments,
  })

  return info
}
