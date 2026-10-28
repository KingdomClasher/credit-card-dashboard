"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  MonthlySpend,
  ValuationMode,
  CreditUtilityState,
  calculateCardRewards,
} from "@/lib/calculator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cards: CreditCard[]
  comparedCardIds: string[]
  onRemoveCard: (cardId: string) => void
  onClearAll: () => void
  spend: MonthlySpend
  valuationMode: ValuationMode
  creditOverrides: CreditUtilityState
}

export function CardComparisonDialog({
  open,
  onOpenChange,
  cards,
  comparedCardIds,
  onRemoveCard,
  onClearAll,
  spend,
  valuationMode,
  creditOverrides,
}: CardComparisonDialogProps) {
  const comparedCards = React.useMemo(() => {
    return comparedCardIds
      .map((id) => cards.find((c) => c.id === id))
      .filter((c): c is CreditCard => Boolean(c))
  }, [cards, comparedCardIds])

  const breakdowns = React.useMemo(() => {
    return comparedCards.map((card) =>
      calculateCardRewards(card, spend, valuationMode, creditOverrides)
    )
  }, [comparedCards, spend, valuationMode, creditOverrides])

  // Identify highest net value card
  const topCardId = React.useMemo(() => {
    if (!breakdowns.length) return null
    let best = breakdowns[0]
    for (const b of breakdowns) {
      if (b.netAnnualValue > best.netAnnualValue) {
        best = b
      }
    }
    return best.card.id
  }, [breakdowns])

  if (comparedCards.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-6 sm:max-w-5xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Head-to-Head Card Comparison
              </DialogTitle>
              <DialogDescription className="text-xs">
                Comparing {comparedCards.length} cards based on your current
                monthly spending budget and valuation mode (
                {valuationMode === "transfer" ? "1.8 cpp" : "1.0 cpp"}).
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Comparison
            </Button>
          </div>
        </DialogHeader>

        {/* Comparison Matrix Grid */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
          {breakdowns.map((item) => {
            const {
              card,
              annualPoints,
              grossDollarValue,
              annualFee,
              utilizedCredits,
              netEffectiveFee,
              netAnnualValue,
              topCategory,
              cppValuation,
            } = item

            const isWinner = card.id === topCardId && breakdowns.length > 1
            const isPositive = netAnnualValue > 0

            return (
              <div
                key={card.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all",
                  isWinner
                    ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                    : "border-border/80 bg-card"
                )}
              >
                {/* Winner Pill */}
                {isWinner && (
                  <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-xs">
                    <Trophy className="size-3" />
                    <span>Top Net Return</span>
                  </div>
                )}

                {/* Card Header */}
                <div className="space-y-2 border-b pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        {card.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {card.issuer} • {card.tier}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveCard(card.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Return Metrics */}
                <div className="space-y-2.5 py-3 text-xs">
                  {/* Net Annual Value */}
                  <div className="rounded-lg bg-muted/40 p-2.5">
                    <div className="text-[11px] text-muted-foreground">
                      Net Annual Return
                    </div>
                    <div
                      className={cn(
                        "font-mono text-xl font-bold",
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      )}
                    >
                      {isPositive ? "+" : ""}${netAnnualValue.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">
                      Annual Points:
                    </span>
                    <span className="font-mono font-semibold">
                      {annualPoints.toLocaleString()} pts
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Gross Value:</span>
                    <span className="font-mono font-semibold">
                      ${grossDollarValue.toFixed(2)}{" "}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        (@{cppValuation}cpp)
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Stated Fee:</span>
                    <span className="font-mono font-semibold">
                      ${annualFee}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">
                      Credits Offset:
                    </span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      -${utilizedCredits}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Net Fee:</span>
                    <span className="font-mono font-semibold">
                      {netEffectiveFee <= 0
                        ? `+$${Math.abs(netEffectiveFee)} profit`
                        : `$${netEffectiveFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Top Category:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {topCategory.label} ({topCategory.rate}x)
                    </Badge>
                  </div>
                </div>

                {/* Best For Tagline */}
                <div className="mt-2 rounded-lg border border-border/40 bg-muted/20 p-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Best For:{" "}
                  </span>
                  {card.bestFor}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
