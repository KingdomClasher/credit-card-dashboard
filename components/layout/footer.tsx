import Link from "next/link"
import {
  CreditCard,
  ShieldCheck,
  Calculator,
  Wallet,
  Bot,
  Sparkles,
  Lock,
  ArrowUpRight,
  Database,
  Sliders,
  FileCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-muted/40 text-foreground transition-colors">
      {/* Security & Privacy Guarantee Callout Banner */}
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Zero-PAN Guarantee
                </span>
                <Badge
                  variant="outline"
                  className="h-4 border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                >
                  100% Client-Side
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Zero-PAN Guarantee - No full card numbers, CVVs, or bank credentials are ever requested or stored. 100% client-side local storage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-primary" />
            <span>Zero Server Data Ingestion</span>
          </div>
        </div>
      </div>

      {/* Main Footer Navigation & Sections */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission column (2 cols on large screens) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <CreditCard className="size-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                    CardPacing
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 py-0 text-[10px] font-normal"
                  >
                    Pro
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Intelligent Credit Card Suite
                </span>
              </div>
            </div>

            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground sm:text-sm">
              CardPacing - Intelligent Credit Card Rewards, Velocity & Churning Underwriting Suite.
              Engineered for churners, travel hackers, and reward optimizers tracking 5/24 velocity,
              welcome bonus spend pacing, and multi-issuer underwriting eligibility.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                35 Premier Cards
              </Badge>
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                Live CPP Valuations
              </Badge>
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                Local Storage Persistence
              </Badge>
            </div>
          </div>

          {/* Quick Links / Navigation */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Card Catalog</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Wallet className="size-3.5 text-primary" />
                  <span>Wallet & Velocity</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Calculator className="size-3.5 text-primary" />
                  <span>Rewards Calculator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/advisor"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Bot className="size-3.5 text-primary" />
                  <span>AI Advisor</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Methodology & Transparency */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
              Methodology
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>Issuer Velocity Rules</span>
                  <ArrowUpRight className="size-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>Custom Valuations (CPP)</span>
                  <ArrowUpRight className="size-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>MSR Pacing Tracker</span>
                  <ArrowUpRight className="size-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>Chase 5/24 Drop-off Math</span>
                  <ArrowUpRight className="size-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Security, Privacy & Architecture */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
              Transparency
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Lock className="size-3.5 text-emerald-500" />
                <span>Zero-PAN Architecture</span>
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Database className="size-3.5 text-blue-500" />
                <span>100% Client-Side Storage</span>
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Sliders className="size-3.5 text-amber-500" />
                <span>Custom CPP Point Valuations</span>
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <FileCheck className="size-3.5 text-indigo-500" />
                <span>Zero Bank Credentials Required</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Issuer Disclosure Bar */}
        <div className="mt-10 border-t border-border/40 pt-6">
          <div className="flex flex-col gap-4 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-4xl text-[11px] leading-relaxed text-muted-foreground/90 sm:text-xs">
              Independent financial utility. Not affiliated with Chase, American Express, Capital One, Citi, Bank of America, or any card issuer. Rewards terms and offers are subject to issuer change. Point valuations are editorial estimates for modeling purposes and not guaranteed redemption rates.
            </p>
            <p className="shrink-0 text-[11px] text-muted-foreground sm:text-xs" suppressHydrationWarning>
              © {currentYear} CardPacing. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
