import Link from "next/link"
import { useRouter } from "next/router"
import { signOut, useSession } from "next-auth/react"

const HeaderLogin: React.FC = () => {
  const router = useRouter()
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname

  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Validating session ...</div>
  }

  if (session) {
    return (
      <>
        <span>
          {session.user?.name} ({session.user?.email})
        </span>
        <Link style={{ marginLeft: "1rem" }} href="/create">
          New event
        </Link>
        <button
          style={{ marginLeft: "1rem" }}
          type="button"
          onClick={() => signOut()}
        >
          Log out
        </button>
      </>
    )
  }

  return (
    <Link href="/api/auth/signin" data-active={isActive("/signup")}>
      Log in
    </Link>
  )
}

export default HeaderLogin
