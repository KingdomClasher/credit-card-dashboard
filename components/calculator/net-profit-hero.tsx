"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import { CardRewardBreakdown, ValuationMode } from "@/lib/calculator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  Plus,
  Coins,
  CreditCard as CardIcon,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NetProfitHeroProps {
  topCardBreakdown: CardRewardBreakdown | null
  totalAnnualSpend: number
  valuationMode: ValuationMode
  onInspectCard?: (card: CreditCard) => void
  onToggleCompare?: (cardId: string) => void
  isCompared?: boolean
  className?: string
}

export function NetProfitHero({
  topCardBreakdown,
  totalAnnualSpend,
  valuationMode,
  onInspectCard,
  onToggleCompare,
  isCompared,
  className,
}: NetProfitHeroProps) {
  if (!topCardBreakdown) return null

  const {
    card,
    netAnnualValue,
    grossDollarValue,
    annualPoints,
    annualFee,
    utilizedCredits,
    topCategory,
  } = topCardBreakdown

  const isPositive = netAnnualValue > 0
  const effectiveReturnPercent =
    totalAnnualSpend > 0
      ? ((netAnnualValue / totalAnnualSpend) * 100).toFixed(1)
      : "0.0"

  const handleInspect = () => {
    if (onInspectCard) {
      onInspectCard(card)
    }
    const analyzerElem = document.getElementById("net-fee-analyzer")
    if (analyzerElem) {
      analyzerElem.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-card via-card to-emerald-500/[0.03] p-5 shadow-sm sm:p-7",
        className
      )}
    >
      {/* Background subtle glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative space-y-6">
        {/* Top Header: Badge, Winner Name, and High-level Tags */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1.5 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600">
              <Trophy className="size-3.5 text-amber-300" />
              #1 Recommended Card
            </Badge>

            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400"
            >
              <Sparkles className="size-3 text-emerald-500" />
              Optimal Yield on Your Spend
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Spend Modeled:</span>
            <strong className="font-mono font-bold text-foreground">
              ${totalAnnualSpend.toLocaleString()}/yr
            </strong>
          </div>
        </div>

        {/* Card Identity and Primary Hero Number */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {card.name}
              </h2>
              <Badge variant="secondary" className="text-xs font-normal">
                {card.issuer}
              </Badge>
            </div>
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span>{card.rewardProgram.name}</span>
              <span>•</span>
              <span className="font-semibold text-foreground">
                Top Multiplier: {topCategory.label} ({topCategory.rate}x)
              </span>
              <span>•</span>
              <span>
                {annualFee > 0 ? `$${annualFee} Annual Fee` : "No Annual Fee"}
              </span>
            </p>
          </div>

          {/* Large Bold Monetary Outcome Metric */}
          <div className="flex flex-col items-start rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4 sm:p-5 lg:items-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Projected Net Annual Profit</span>
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "font-mono text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl",
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                )}
              >
                {isPositive ? "+" : ""}${netAnnualValue.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                / year
              </span>
            </div>

            {/* Badges with Net Gain after fees */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
              >
                {annualFee > 0
                  ? `+$${netAnnualValue.toFixed(2)} gain after $${annualFee} annual fee`
                  : "100% fee-free pure return"}
              </Badge>

              <Badge
                variant="secondary"
                className="text-[11px] font-mono font-semibold"
              >
                {effectiveReturnPercent}% net return on spend
              </Badge>
            </div>
          </div>
        </div>

        {/* Clear Bottom-Line Financial Breakdown Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="tracking-wider uppercase">
              Bottom-Line Return Breakdown
            </span>
            <span className="text-[11px]">
              Valuation:{" "}
              {valuationMode === "transfer" ? "1.8¢/pt (Transfer)" : "1.0¢/pt (Cash)"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Gross Rewards Earned */}
            <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  1. Gross Rewards Earned
                </span>
                <Coins className="size-3.5 text-primary" />
              </div>
              <div className="mt-2">
                <div className="font-mono text-lg font-bold text-foreground">
                  +${grossDollarValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {annualPoints.toLocaleString()} points / yr
                </div>
              </div>
            </div>

            {/* 2. Statement Credits Offset */}
            <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  2. Statement Credits
                </span>
                <ShieldCheck className="size-3.5 text-emerald-500" />
              </div>
              <div className="mt-2">
                <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +${utilizedCredits.toFixed(2)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Offsetting perks & credits
                </div>
              </div>
            </div>

            {/* 3. Stated Annual Fee */}
            <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  3. Stated Annual Fee
                </span>
                <CardIcon className="size-3.5 text-destructive" />
              </div>
              <div className="mt-2">
                <div className="font-mono text-lg font-bold text-destructive">
                  {annualFee === 0 ? "$0" : `-$${annualFee}`}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {annualFee === 0 ? "No holding cost" : "Fixed yearly fee"}
                </div>
              </div>
            </div>

            {/* 4. Net Bottom Line Return */}
            <div className="flex flex-col justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  4. True Net Profit
                </span>
                <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
                  +${netAnnualValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  (Rewards + Credits) − Fee
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HelpCircle className="size-3.5 text-muted-foreground/70" />
            <span>
              Calculated using live spend multipliers and verified statement credit utility.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onToggleCompare && (
              <Button
                variant={isCompared ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleCompare(card.id)}
                className="h-8 text-xs font-semibold"
              >
                {isCompared ? (
                  <>
                    <Check className="mr-1.5 size-3" />
                    In Comparison Dock
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 size-3" />
                    Add to Compare
                  </>
                )}
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handleInspect}
              className="h-8 text-xs font-semibold"
            >
              Inspect Fee Waterfall
              <ArrowRight className="ml-1.5 size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
