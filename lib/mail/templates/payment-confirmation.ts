import { MerchOptions } from "../../purchase/types"

type PlaceholderData = {
  name: string
  email: string
  merch: Record<string, Record<string, string>>
  backgroundColor: string
  pageContrastColor: string
  pagePrimaryColor: string
  supportEmail?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export const render: (placeholderData: PlaceholderData) => string = (
  placeholderData
) => {
  const {
    name,
    email,
    backgroundColor,
    pageContrastColor,
    pagePrimaryColor,
    supportEmail,
  } = placeholderData
  const merchOptions = (placeholderData.merch as MerchOptions) || {}
  return `
  <html>
    <head>
      <title>Thanks for your purchase!</title>
    </head>
    <body style="background:${backgroundColor};color:${pageContrastColor};padding:0;margin:0;font-size:18px;line-height:1.5">
    <div style="height:158px;background:${pagePrimaryColor}"></div>
    <div style="padding:2rem 2rem 4rem;font-size:18px;">
      <h1 style="font-size:48px;margin-top:0">Thanks for your purchase!</h1>
      <p>Hey ${escapeHtml(name)}, we received the payment. There are details of your purchase:</p>
      <pre>
    ${escapeHtml(name)}
    ${escapeHtml(email)}
    ${Object.keys(merchOptions)
      .map(
        (key) =>
          `${escapeHtml(key)}: ${Object.keys(merchOptions[key])
            .map(
              (variant) =>
                `${escapeHtml(variant)} - ${escapeHtml(String(merchOptions[key][variant]).toUpperCase())}`
            )
            .join(" ")}
    `
      )
      .join("")}
    </pre>
      <p>This is your unique QR code to be used at the event check-in desk:</p>
      <img src="cid:ticketimage" alt="Your ticket QR code"/>
      ${supportEmail ? `<p>Don’t hesitate to contact us in case you have any questions: <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a></p>` : ""}
    </div>
    </body>
  </html>`
}
