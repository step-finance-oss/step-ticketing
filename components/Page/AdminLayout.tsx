import Link from "next/link"
import Meta, { MetaProps } from "./Meta"
import SignOutButton from "./SignOutButton"

export interface AdminLayoutProps {
  children?: React.ReactNode
  heading?: string
  meta?: MetaProps["data"]
  backUrl?: string
  hideLogoutButton?: boolean
}

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const { heading, meta, backUrl, hideLogoutButton } = props

  return (
    <main>
      {meta && <Meta data={meta} />}
      <div className="px-4 py-4 lg:py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight font-headers">
          {heading}
          {backUrl && (
            <Link
              href={backUrl}
              className="ml-6 text-base text-primary hover:underline"
            >
              ⏎&nbsp;back
            </Link>
          )}
        </h2>
        {!hideLogoutButton && <SignOutButton />}
      </div>
      <div className="px-4 pb-24">{props.children}</div>
    </main>
  )
}

export default AdminLayout
