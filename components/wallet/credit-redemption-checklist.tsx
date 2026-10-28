"use client"

import * as React from "react"
import { CreditRedemptionItem } from "@/lib/types/wallet"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreditRedemptionChecklistProps {
  items: CreditRedemptionItem[]
  onToggleRedemption: (id: string) => void
  onResetRedemptions: () => void
}

export function CreditRedemptionChecklist({
  items,
  onToggleRedemption,
  onResetRedemptions,
}: CreditRedemptionChecklistProps) {
  const [frequencyFilter, setFrequencyFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "redeemed"
  >("all")
  const [selectedCardFilter, setSelectedCardFilter] =
    React.useState<string>("all")

  // Unique card names for filter
  const cardNames = React.useMemo(() => {
    return Array.from(new Set(items.map((i) => i.cardName)))
  }, [items])

  // Aggregate stats
  const totalValue = items.reduce((sum, item) => sum + item.amount, 0)
  const redeemedValue = items
    .filter((i) => i.isRedeemed)
    .reduce((sum, item) => sum + item.amount, 0)
  const remainingValue = Math.max(0, totalValue - redeemedValue)
  const percentRedeemed =
    totalValue > 0 ? Math.round((redeemedValue / totalValue) * 100) : 0

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (
        frequencyFilter !== "all" &&
        item.frequency.toLowerCase() !== frequencyFilter
      ) {
        return false
      }
      if (statusFilter === "pending" && item.isRedeemed) return false
      if (statusFilter === "redeemed" && !item.isRedeemed) return false
      if (selectedCardFilter !== "all" && item.cardName !== selectedCardFilter)
        return false
      return true
    })
  }, [items, frequencyFilter, statusFilter, selectedCardFilter])

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                Statement Credit Redemptions
              </CardTitle>
              <CardDescription className="text-xs">
                Annual and monthly perk checklist to maximize card value
              </CardDescription>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetRedemptions}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Reset checklist for a new cycle"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Cycle</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Metric Bar */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-4">
          <div>
            <span className="text-[11px] text-muted-foreground">
              Total Card Perks
            </span>
            <p className="font-heading text-lg font-bold text-foreground">
              ${totalValue.toLocaleString()}/yr
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">
              Captured Value
            </span>
            <p className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ${redeemedValue.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">
              Remaining on Table
            </span>
            <p className="font-heading text-lg font-bold text-amber-600 dark:text-amber-400">
              ${remainingValue.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground">
              Perk Capture Rate
            </span>
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-bold text-foreground">
                {percentRedeemed}%
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  percentRedeemed >= 75
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : percentRedeemed >= 40
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-muted text-muted-foreground"
                )}
              >
                {percentRedeemed >= 100
                  ? "Fully Redeemed"
                  : `${items.filter((i) => i.isRedeemed).length}/${items.length} Done`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${percentRedeemed}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>${redeemedValue.toLocaleString()} redeemed</span>
            <span>${remainingValue.toLocaleString()} uncollected</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border/60 py-2.5">
          {/* Frequency pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-medium text-muted-foreground">
              Frequency:
            </span>
            {["all", "monthly", "semi-annual", "annual"].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequencyFilter(freq)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors",
                  frequencyFilter === freq
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {freq}
              </button>
            ))}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 text-xs">
            {(["all", "pending", "redeemed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors",
                  statusFilter === st
                    ? "border border-border bg-secondary font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Cards filter if multiple cards */}
        {cardNames.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground">
              Card:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCardFilter("all")}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                selectedCardFilter === "all"
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              )}
            >
              All Cards ({items.length})
            </button>
            {cardNames.map((cName) => {
              const count = items.filter((i) => i.cardName === cName).length
              return (
                <button
                  key={cName}
                  type="button"
                  onClick={() => setSelectedCardFilter(cName)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors",
                    selectedCardFilter === cName
                      ? "border border-primary/30 bg-primary/10 text-primary"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cName} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Checklist items list */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed py-6 text-center text-xs text-muted-foreground">
            No statement credits match your current filter.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleRedemption(item.id)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all select-none",
                  item.isRedeemed
                    ? "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/40"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      item.isRedeemed
                        ? "border-emerald-500 bg-emerald-500 text-primary-foreground"
                        : "border-muted-foreground/40 group-hover:border-primary"
                    )}
                  >
                    {item.isRedeemed && (
                      <CheckCircle2 className="size-3.5 text-white" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold tracking-tight transition-colors",
                          item.isRedeemed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {item.creditName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="h-4 px-1 py-0 text-[9px] font-normal tracking-wider uppercase"
                      >
                        {item.frequency}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      {item.cardName}
                      {item.resetDate && (
                        <span> • Resets: {item.resetDate}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      "font-heading text-sm font-bold",
                      item.isRedeemed
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    )}
                  >
                    ${item.amount}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {item.isRedeemed ? "Claimed" : "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
