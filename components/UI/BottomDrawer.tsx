export type BottomDrawerProps = {
  children?: React.ReactNode
  open?: boolean
  onClose?: () => void
}

const BottomDrawer: React.FC<BottomDrawerProps> = (props) => {
  const { open = false, children, onClose } = props

  return (
    <>
      {open && (
        <div className="fixed z-40 inset-0 bg-page/50" onClick={onClose} />
      )}
      <div
        id="drawer-swipe"
        className={`fixed mx-auto max-w-2xl  max-h-90 lg:max-w-4xl z-40 w-full overflow-y-auto bg-paper rounded-t-lg transition-transform bottom-0 left-0 right-0 bottom-0 translate-y-full ${open ? "transform-none" : ""}`}
        tabIndex={open ? 1 : -1}
        aria-labelledby="drawer-swipe-label"
      >
        <div className="w-full bg-paper-contrast/5 rounded-t-lg">
          <div className="p-4" data-drawer-toggle="drawer-swipe">
            <span className="absolute w-8 h-1 -translate-x-1/2 bg-gray-300 rounded-lg top-3 left-1/2 dark:bg-gray-600"></span>
          </div>
          <div className="min-h-[40px]">{children}</div>
        </div>
      </div>
    </>
  )
}

export default BottomDrawer
