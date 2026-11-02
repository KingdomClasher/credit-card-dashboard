"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  MonthlySpend,
  ValuationMode,
  CreditUtilityState,
  DEFAULT_MONTHLY_SPEND,
  calculateCardRewards,
} from "@/lib/calculator"
import { Navbar } from "@/components/layout/navbar"
import { SpendInputMatrix } from "@/components/calculator/spend-input-matrix"
import { NetProfitHero } from "@/components/calculator/net-profit-hero"
import { HowWeCalculateThis } from "@/components/calculator/how-we-calculate-this"
import { RewardsRankingTable } from "@/components/calculator/rewards-ranking-table"
import { NetFeeWaterfall } from "@/components/calculator/net-fee-waterfall"
import { CardComparisonDialog } from "@/components/calculator/card-comparison-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, Trophy, ArrowRight, X, Wallet } from "lucide-react"

interface CalculatorViewProps {
  cards: CreditCard[]
}

export function CalculatorView({ cards }: CalculatorViewProps) {
  // Spend state: defaults to Urban Foodie preset
  const [spend, setSpend] = React.useState<MonthlySpend>(DEFAULT_MONTHLY_SPEND)

  // Valuation mode: Conservative (1.0 cpp) vs Transfer Partner (1.8 cpp)
  const [valuationMode, setValuationMode] =
    React.useState<ValuationMode>("transfer")

  // Selected card for Net Fee Analyzer (default to Chase Sapphire Reserve)
  const [selectedCardId, setSelectedCardId] = React.useState<string>(() => {
    const defaultCard = cards.find((c) => c.id === "chase-sapphire-reserve")
    return defaultCard ? defaultCard.id : cards[0]?.id || ""
  })

  // Credit utility overrides state
  const [creditOverrides, setCreditOverrides] =
    React.useState<CreditUtilityState>({})

  // Compared cards state
  const [comparedCardIds, setComparedCardIds] = React.useState<string[]>([])
  const [comparisonModalOpen, setComparisonModalOpen] = React.useState(false)

  // Find currently selected card object
  const selectedCard = React.useMemo(() => {
    return (
      cards.find((c) => c.id === selectedCardId) ||
      cards[0] ||
      ({} as CreditCard)
    )
  }, [cards, selectedCardId])

  // Handle credit override updates
  const handleCreditOverrideChange = (
    key: string,
    enabled: boolean,
    utilityWeight: number
  ) => {
    setCreditOverrides((prev) => ({
      ...prev,
      [key]: {
        enabled,
        utilityWeight,
      },
    }))
  }

  // Toggle card comparison
  const handleToggleCompareCard = (cardId: string) => {
    setComparedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId)
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), cardId]
      }
      return [...prev, cardId]
    })
  }

  const handleRemoveCompareCard = (cardId: string) => {
    setComparedCardIds((prev) => prev.filter((id) => id !== cardId))
  }

  const handleClearCompareCards = () => {
    setComparedCardIds([])
    setComparisonModalOpen(false)
  }

  // Calculate top ranking card for KPIs
  const topCardBreakdown = React.useMemo(() => {
    if (!cards.length) return null
    const breakdowns = cards.map((c) =>
      calculateCardRewards(c, spend, valuationMode, creditOverrides)
    )
    breakdowns.sort((a, b) => b.netAnnualValue - a.netAnnualValue)
    return breakdowns[0]
  }, [cards, spend, valuationMode, creditOverrides])

  // Total annual spend
  const totalAnnualSpend = React.useMemo(() => {
    return Object.values(spend).reduce((sum, v) => sum + (v || 0), 0) * 12
  }, [spend])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Header */}
      <section className="relative border-b bg-muted/20 py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-primary/30 bg-primary/5 py-1 text-xs font-medium text-primary"
                >
                  <Calculator className="size-3.5" />
                  Net Value & Rewards Calculator
                </Badge>
                <Badge
                  variant="secondary"
                  className="h-5 text-[10px] font-semibold tracking-wide uppercase"
                >
                  Real-time Yield Engine
                </Badge>
              </div>

              <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                Net Value & Rewards Calculator
              </h1>

              <p className="text-sm text-muted-foreground sm:text-base">
                Model your real-world monthly category spend, evaluate net rewards
                after annual fees, and discover your highest-yielding card portfolio.
              </p>
            </div>

            {/* Quick KPI stats preview */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Annual Spend Budget
                  </div>
                  <div className="font-heading text-sm font-bold text-foreground">
                    ${totalAnnualSpend.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    ${Math.round(totalAnnualSpend / 12).toLocaleString()}/month
                  </div>
                </div>
              </div>

              {topCardBreakdown && (
                <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Trophy className="size-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      #1 Net Return Card
                    </div>
                    <div className="font-heading text-sm font-bold text-foreground">
                      {topCardBreakdown.card.name}
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +${topCardBreakdown.netAnnualValue.toFixed(2)}/yr return
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Section 1: Monthly Spend Matrix */}
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
            <SpendInputMatrix
              spend={spend}
              onChange={(newSpend) => setSpend(newSpend)}
            />
          </section>

          {/* Section 2: Prominently Elevated Net Profit Outcome Spotlight */}
          {topCardBreakdown && (
            <section
              id="top-profit-recommendation"
              aria-label="Top Net Profit Recommendation"
            >
              <NetProfitHero
                topCardBreakdown={topCardBreakdown}
                totalAnnualSpend={totalAnnualSpend}
                valuationMode={valuationMode}
                onInspectCard={(card) => setSelectedCardId(card.id)}
                onToggleCompare={handleToggleCompareCard}
                isCompared={comparedCardIds.includes(topCardBreakdown.card.id)}
              />
            </section>
          )}

          {/* Section 3: Progressive Disclosure - "How We Calculate This" */}
          <section aria-label="Calculation Methodology and Valuation Settings">
            <HowWeCalculateThis
              valuationMode={valuationMode}
              onValuationModeChange={(mode) => setValuationMode(mode)}
            />
          </section>

          {/* Section 4: Dynamic Card Ranking Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Card Rankings by Net Annual Value
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ranked by gross rewards earned plus utilized statement credits
                  minus annual fee.
                </p>
              </div>
            </div>

            <RewardsRankingTable
              cards={cards}
              spend={spend}
              valuationMode={valuationMode}
              creditOverrides={creditOverrides}
              selectedCardId={selectedCardId}
              onSelectCard={(card) => setSelectedCardId(card.id)}
              comparedCardIds={comparedCardIds}
              onToggleCompareCard={handleToggleCompareCard}
            />
          </section>

          {/* Section 5: Net Effective Fee Analyzer */}
          <section id="net-fee-analyzer" className="pt-2">
            <NetFeeWaterfall
              card={selectedCard}
              cards={cards}
              onSelectCard={(card) => setSelectedCardId(card.id)}
              creditOverrides={creditOverrides}
              onCreditOverrideChange={handleCreditOverrideChange}
            />
          </section>
        </div>
      </main>

      {/* Mobile Floating Net Profit Bar (Sticky above Mobile Nav) */}
      {topCardBreakdown && comparedCardIds.length === 0 && (
        <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transform animate-in fade-in-0 slide-in-from-bottom-4 md:hidden">
          <button
            type="button"
            onClick={() => {
              const el =
                document.getElementById("top-profit-recommendation") ||
                document.getElementById("net-fee-analyzer")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            className="flex min-h-[44px] w-full items-center justify-between rounded-full border border-primary/20 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <Trophy className="size-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Top Card
                </span>
                <span className="max-w-[120px] truncate text-xs font-bold text-foreground">
                  {topCardBreakdown.card.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                +{topCardBreakdown.netAnnualValue >= 0 ? "" : "-"}$
                {Math.abs(
                  Math.round(topCardBreakdown.netAnnualValue)
                ).toLocaleString()}{" "}
                / yr Net Profit
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Bottom Comparison Dock */}
      {comparedCardIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 z-40 -translate-x-1/2 transform animate-in fade-in-0 slide-in-from-bottom-4">
          <div className="flex items-center gap-3 rounded-full border border-border/80 bg-background/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {comparedCardIds.length}
              </span>
              <span className="text-xs font-semibold text-foreground">
                Cards to Compare
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => setComparisonModalOpen(true)}
              className="h-8 text-xs font-semibold"
            >
              Compare Side-by-Side
              <ArrowRight className="ml-1 size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClearCompareCards}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear comparison"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Card Comparison Modal */}
      <CardComparisonDialog
        open={comparisonModalOpen}
        onOpenChange={setComparisonModalOpen}
        cards={cards}
        comparedCardIds={comparedCardIds}
        onRemoveCard={handleRemoveCompareCard}
        onClearAll={handleClearCompareCards}
        spend={spend}
        valuationMode={valuationMode}
        creditOverrides={creditOverrides}
      />
    </div>
  )
}
