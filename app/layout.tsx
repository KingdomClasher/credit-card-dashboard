import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { MobileNav } from "@/components/layout/mobile-nav"
import { OnboardingDialog } from "@/components/layout/onboarding-dialog"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "Credit Card Rewards & Portfolio Dashboard",
    template: "%s | Credit Card Dashboard",
  },
  description:
    "Comprehensive 35-card rewards catalog, interactive annual fee calculator, Chase 5/24 & multi-issuer velocity tracker, and AI financial advisor.",
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "pk_test_dGVzdC5jbGVyay5hY2NvdW50cy5kZXYk"
      }
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "antialiased",
          fontMono.variable,
          "font-sans",
          geist.variable
        )}
      >
        <body>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
            </div>
            <MobileNav />
            <OnboardingDialog />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
