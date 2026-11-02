"use client"

import * as React from "react"
import { ValuationMode } from "@/lib/calculator"
import { ValuationToggle } from "@/components/calculator/valuation-toggle"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Coins,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HowWeCalculateThisProps {
  valuationMode: ValuationMode
  onValuationModeChange: (mode: ValuationMode) => void
  className?: string
}

export function HowWeCalculateThis({
  valuationMode,
  onValuationModeChange,
  className,
}: HowWeCalculateThisProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card transition-all shadow-xs",
        className
      )}
    >
      {/* Collapsible Header / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer flex-col gap-3 p-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-5 hover:bg-muted/30 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-sm font-bold text-foreground sm:text-base">
                How We Calculate This
              </span>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] font-semibold"
              >
                {valuationMode === "transfer" ? "1.8 cpp Transfer" : "1.0 cpp Cash"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Progressive disclosure: Formulas, point valuation models & statement credit utility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-primary">
            {isOpen ? "Hide Math & Settings" : "Customize & View Formulas"}
          </span>
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-transform">
            {isOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Progressive Disclosure Panel */}
      {isOpen && (
        <div className="border-t border-border/60 p-4 pt-5 sm:p-6 space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Section 1: Granular Math Toggles (Point Valuation Mode) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" />
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Valuation Mode & Point Multipliers
                </h4>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Affects all transferable currency conversions
              </span>
            </div>

            <ValuationToggle
              value={valuationMode}
              onChange={onValuationModeChange}
            />

            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span>
                <strong>What is CPP?</strong> Cents-per-point (CPP) represents the cash value of one reward point. While cash back cards are fixed at 1.0¢/pt ($0.01), transferable rewards (Chase Ultimate Rewards, Amex Membership Rewards, Capital One Miles) routinely yield 1.8¢/pt or higher when redeemed for premium flights or Hyatt hotel stays.
              </span>
            </div>
          </div>

          {/* Section 2: Transparent Financial Formulas */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-foreground">
              Calculation Methodology & Formulas
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Formula 1: Point Yield */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Coins className="size-4 text-primary" />
                  <span>1. Gross Points & Value</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 font-mono text-[11px] font-semibold text-foreground">
                  Points = 12 × Σ(Spend × Multiplier)
                  <br />
                  Gross $ = Points × (CPP ÷ 100)
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Calculates annual rewards earned across each category rate.
                </p>
              </div>

              {/* Formula 2: Credit Utility */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>2. Statement Credit Utility</span>
                </div>
                <div className="rounded-lg bg-muted/50 p-2 font-mono text-[11px] font-semibold text-foreground">
                  Credits = Σ(Face Value × Utility %)
                  <br />
                  Default: 100% Face Value
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Prevents coupon-book inflation by letting you discount perks you don&apos;t use.
                </p>
              </div>

              {/* Formula 3: Net Annual Return */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-4" />
                  <span>3. Net Annual Profit</span>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Net Profit = Gross $ + Credits − Fee
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The true bottom line: What you pocket after reimbursing the annual holding fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
