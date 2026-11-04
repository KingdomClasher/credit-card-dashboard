import Link from "next/link"
import { CreditCard } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Main row */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Brand and subtle tagline */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="font-heading font-semibold text-foreground">
                Credit Card Dashboard
              </span>
              <span className="text-[11px] text-muted-foreground">
                Portfolio & Rewards Suite
              </span>
            </div>
          </div>

          {/* Clean horizontal navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Catalog
            </Link>
            <Link
              href="/wallet"
              className="transition-colors hover:text-foreground"
            >
              Wallet
            </Link>
            <Link
              href="/calculator"
              className="transition-colors hover:text-foreground"
            >
              Calculator
            </Link>
            <Link
              href="/advisor"
              className="transition-colors hover:text-foreground"
            >
              AI Advisor
            </Link>
          </nav>
        </div>

        {/* Bottom line / subtext */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-border/20 pt-4 text-center text-[11px] text-muted-foreground sm:flex-row sm:text-left">
          <p>
            Credit Card Dashboard is an independent utility. Not affiliated with Chase, Amex, or any bank. 100% private client-side local storage.
          </p>
          <p className="shrink-0" suppressHydrationWarning>
            © {currentYear} Credit Card Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
