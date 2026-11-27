import Head from "next/head"

export interface MetaProps {
  data: { title?: string | null; description?: string | null }
}

const Meta: React.FC<MetaProps> = (props) => {
  const { data } = props

  return (
    <Head>
      <title>{data.title ?? ""}</title>
      <meta
        property="og:title"
        content={data.title ?? ""}
        key="title"
      />
      <meta property="description" content={data.description ?? ""} />
      <meta property="og:description" content={data.description ?? ""} />
      <meta property="twitter:card" content="app" />
      <meta property="twitter:title" content={data.title ?? ""} />
      <meta property="twitter:description" content={data.description ?? ""} />
    </Head>
  )
}

export default Meta
