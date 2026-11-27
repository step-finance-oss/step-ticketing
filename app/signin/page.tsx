import Layout from "components/Page/Layout"
import { Metadata } from "next"
import SignInContent from "./content"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sign in",
  }
}

const SignInPage = () => {
  return (
    <Layout
      heading="Sign in"
      description="Sign in Admin panel to manage and check-in guests."
    >
      <div className="max-w-md w-full pb-20 mx-auto px-4">
        <SignInContent />
      </div>
    </Layout>
  )
}

export default SignInPage
