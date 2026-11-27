import Header from "./Header"
import Meta, { MetaProps } from "./Meta"
import ReturnButton from "./ReturnButton"

export interface LayoutProps {
  children?: React.ReactNode
  heading?: string
  description?: string
  returnLabel?: string
  returnHref?: string
  meta?: MetaProps["data"]
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { heading, description, meta, returnLabel, returnHref } = props

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_5%,var(--tw-gradient-stops))] from-bg-in/90 via-bg-out/30 to-page">
      {meta && <Meta data={meta} />}
      <ReturnButton label={returnLabel} href={returnHref} />
      <Header heading={heading} description={description} />
      {props.children}
    </main>
  )
}

export default Layout
