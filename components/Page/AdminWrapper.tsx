const AdminWrapper: React.FC<React.PropsWithChildren> = (props) => {
  return <div className="mx-auto max-w-2xl lg:max-w-4xl">{props.children}</div>
}

export default AdminWrapper
