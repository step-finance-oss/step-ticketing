"use client"

import { signOut } from "next-auth/react"

const SignOutButton: React.FC = () => {
  return (
    <button
      type="submit"
      className="ml-4 font-headers rounded-md bg-primary text-primary-contrast hover:bg-primary/80 px-3 py-2 text-center font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      onClick={() => signOut()}
    >
      Logout
    </button>
  )
}

export default SignOutButton
