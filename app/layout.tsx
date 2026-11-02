import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
