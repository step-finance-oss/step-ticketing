import Head from "next/head"

export interface MetaProps {
  links?: string[]
}

const Fonts: React.FC<MetaProps> = (props) => {
  const { links } = props

  if (!links || links.length === 0) {
    return null
  }

  return (
    <Head>
      {links.map((link, index) => (
        <link key={index} href={link} rel="stylesheet" />
      ))}
    </Head>
  )
}

export default Fonts
