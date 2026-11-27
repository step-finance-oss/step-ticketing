import { getServerSession } from "next-auth"
import { SessionProvider } from "components/SessionProvider"
import "../components/Page/global.css"
import { nextAuthOptions } from "lib/auth"

const FONTS = process.env.FONT_LINKS?.split(/[ ]+/) ?? undefined
const FAVICON = process.env.FAVICON ?? undefined

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(nextAuthOptions)
  return (
    <html lang="en">
      <body>
        {FONTS?.map((link, index) => (
          <link key={index} href={link} rel="stylesheet" />
        ))}
        {FAVICON && <link rel="shortcut icon" href={FAVICON} />}
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
