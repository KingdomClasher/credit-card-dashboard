import type { Metadata } from "next"
import { SignIn } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Credit Card Dashboard account to sync your portfolio across devices.",
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </main>
  )
}
