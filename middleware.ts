import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/wallet(.*)", "/dashboard(.*)"])

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect()
    }
  },
  {
    publishableKey:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      "pk_test_dGVzdC5jbGVyay5hY2NvdW50cy5kZXYk",
    secretKey:
      process.env.CLERK_SECRET_KEY ||
      "sk_test_dummyclerksecretkeyforbuild12345",
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
