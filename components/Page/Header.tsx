interface HeaderProps {
  heading?: string
  description?: string
}

const Header: React.FC<HeaderProps> = (props) => {
  const { heading, description } = props

  return (
    <div className="px-4 py-8 lg:py-20 mx-auto max-w-2xl text-center lg:max-w-4xl">
      <h2 className="text-5xl font-bold tracking-tight font-headers">
        {heading}
      </h2>
      {description && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-xl leading-8 opacity-80">
          {description}
        </p>
      )}
    </div>
  )
}

export default Header
