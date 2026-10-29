import type { Metadata } from "next"
import { SignUp } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an account on Credit Card Dashboard to persist your cards, Chase 5/24 status, and MSR targets.",
}

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </main>
  )
}
