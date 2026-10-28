"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  CreditUtilityState,
  getCardCredits,
  calculateNetEffectiveFee,
} from "@/lib/calculator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CreditCard as CardIcon,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NetFeeWaterfallProps {
  card: CreditCard
  cards: CreditCard[]
  onSelectCard: (card: CreditCard) => void
  creditOverrides: CreditUtilityState
  onCreditOverrideChange: (
    key: string,
    enabled: boolean,
    utilityWeight: number
  ) => void
  onResetCardCredits?: (cardId: string) => void
  className?: string
}

export function NetFeeWaterfall({
  card,
  cards,
  onSelectCard,
  creditOverrides,
  onCreditOverrideChange,
  className,
}: NetFeeWaterfallProps) {
  const credits = React.useMemo(() => getCardCredits(card), [card])
  const annualFee = card.annualFee || 0

  // Calculate utilized credits and effective values
  const creditsBreakdown = React.useMemo(() => {
    return credits.map((credit, idx) => {
      const key = `${card.id}::${idx}::${credit.name}`
      const override = creditOverrides[key]
      const enabled = override !== undefined ? override.enabled : true
      const utilityWeight =
        override !== undefined ? override.utilityWeight : 1.0
      const effectiveValue = enabled
        ? Math.round((credit.amount || 0) * utilityWeight)
        : 0

      return {
        key,
        idx,
        credit,
        enabled,
        utilityWeight,
        effectiveValue,
      }
    })
  }, [card, credits, creditOverrides])

  const totalCreditsOffset = React.useMemo(() => {
    return creditsBreakdown.reduce((sum, c) => sum + c.effectiveValue, 0)
  }, [creditsBreakdown])

  const netEffectiveFee = calculateNetEffectiveFee(card, creditOverrides)
  const isProfitable = netEffectiveFee < 0
  const isZero = netEffectiveFee === 0

  // Quick preset helper
  const handleSetAllWeights = (weight: number) => {
    creditsBreakdown.forEach((item) => {
      onCreditOverrideChange(item.key, weight > 0, weight)
    })
  }

  // Filter cards with annual fees or credits for quick switching
  const cardsWithCredits = React.useMemo(() => {
    return cards.filter(
      (c) => (c.annualFee && c.annualFee > 0) || getCardCredits(c).length > 0
    )
  }, [cards])

  return (
    <div
      className={cn(
        "space-y-6 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6",
        className
      )}
    >
      {/* Header & Card Selector */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingDown className="size-4" />
            </span>
            <h3 className="font-heading text-base font-bold text-foreground">
              Net Effective Annual Fee Analyzer
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Discounts statement credits according to real user utility rather
            than headline marketing value.
          </p>
        </div>

        {/* Card Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            Analyzing:
          </span>
          <Select
            value={card.id}
            onValueChange={(cardId) => {
              if (!cardId) return
              const found = cards.find((c) => c.id === cardId)
              if (found) onSelectCard(found)
            }}
          >
            <SelectTrigger className="h-8 max-w-64 text-xs font-semibold">
              <SelectValue>{card.name}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-80">
              {cardsWithCredits.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  <span>{c.name}</span>
                  <span className="font-mono text-muted-foreground">
                    (${c.annualFee}/yr)
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards: Stated Fee -> Credits Offset -> Net Effective Fee */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Stated Annual Fee */}
        <div className="flex flex-col justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Stated Annual Fee
            </span>
            <Badge
              variant="outline"
              className="border-destructive/30 text-[10px] text-destructive"
            >
              Charged Annually
            </Badge>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-destructive">
            ${annualFee.toLocaleString()}
          </div>
          <span className="mt-1 text-[11px] text-muted-foreground">
            Fixed out-of-pocket invoice from {card.issuer}
          </span>
        </div>

        {/* Total Credits Offset */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Credits Offset
            </span>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
            >
              {
                creditsBreakdown.filter(
                  (c) => c.enabled && c.effectiveValue > 0
                ).length
              }{" "}
              of {credits.length} Used
            </Badge>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            -${totalCreditsOffset.toLocaleString()}
          </div>
          <span className="mt-1 text-[11px] text-muted-foreground">
            Utility-adjusted personal value
          </span>
        </div>

        {/* Net Effective Fee */}
        <div
          className={cn(
            "flex flex-col justify-between rounded-xl border p-4",
            isProfitable
              ? "border-emerald-500/30 bg-emerald-500/10"
              : isZero
                ? "border-primary/30 bg-primary/10"
                : "border-amber-500/30 bg-amber-500/10"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              True Out-of-Pocket Cost
            </span>
            {isProfitable ? (
              <Badge
                variant="default"
                className="bg-emerald-600 text-[10px] text-white"
              >
                Net Profitable
              </Badge>
            ) : isZero ? (
              <Badge variant="secondary" className="text-[10px]">
                $0 Break-Even
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500 text-[10px] text-amber-700 dark:text-amber-400"
              >
                Holding Cost
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "mt-2 font-mono text-2xl font-bold",
              isProfitable
                ? "text-emerald-600 dark:text-emerald-400"
                : isZero
                  ? "text-primary"
                  : "text-foreground"
            )}
          >
            {isProfitable
              ? `+$${Math.abs(netEffectiveFee).toLocaleString()} surplus`
              : `$${netEffectiveFee.toLocaleString()}`}
          </div>
          <span className="mt-1 text-[11px] text-muted-foreground">
            {isProfitable
              ? "Credits exceed annual fee before spending a single dollar"
              : "Annual fee burden that must be recouped via rewards"}
          </span>
        </div>
      </div>

      {/* Visual Waterfall Bar: Stated Fee -> Credits Offset -> True Cost */}
      <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Fee Offset Waterfall</span>
          <span className="font-mono">
            {annualFee > 0
              ? `${Math.min(100, Math.round((totalCreditsOffset / annualFee) * 100))}% offset`
              : "No Annual Fee"}
          </span>
        </div>

        {annualFee > 0 ? (
          <div className="space-y-1.5">
            {/* Multi-segment progress visualizer */}
            <div className="relative flex h-5 w-full overflow-hidden rounded-md bg-destructive/15">
              {/* Offset portion */}
              <div
                className="flex items-center justify-end bg-emerald-500 pr-1.5 text-[10px] font-bold text-white transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalCreditsOffset / Math.max(annualFee, totalCreditsOffset)) * 100)}%`,
                }}
              >
                {totalCreditsOffset > 0 && <span>-${totalCreditsOffset}</span>}
              </div>
              {/* Uncovered fee portion (if any) */}
              {netEffectiveFee > 0 && (
                <div
                  className="flex items-center justify-center bg-destructive/60 text-[10px] font-bold text-white transition-all duration-300"
                  style={{
                    width: `${(netEffectiveFee / Math.max(annualFee, totalCreditsOffset)) * 100}%`,
                  }}
                >
                  ${netEffectiveFee}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" />
                Credits Utilized (${totalCreditsOffset})
              </span>
              <span className="flex items-center gap-1 font-medium">
                <ArrowRight className="size-3" />
                True Cost: ${Math.max(0, netEffectiveFee)}
              </span>
              <span className="flex items-center gap-1 font-medium text-destructive">
                <span className="size-2 rounded-full bg-destructive" />
                Stated Fee (${annualFee})
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>
              This card has a $0 Annual Fee. All reward earnings are 100% net
              profit with zero holding cost friction.
            </span>
          </div>
        )}
      </div>

      {/* Checkbox Ledger of Credits */}
      {credits.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Credits Ledger & Utility Weight Calibration ({credits.length}{" "}
              Statement Credits)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSetAllWeights(1.0)}
                className="text-[11px]"
              >
                100% (Face Value)
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSetAllWeights(0.7)}
                className="text-[11px]"
              >
                70% (Moderate)
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSetAllWeights(0)}
                className="text-[11px]"
              >
                0% (Deselect All)
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
            {creditsBreakdown.map((item) => {
              const frequencyLabel = item.credit.frequency
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())

              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex flex-col gap-3 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between",
                    !item.enabled && "bg-muted/10 opacity-50"
                  )}
                >
                  {/* Left: Checkbox + Name + Description */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={item.enabled}
                      onCheckedChange={(checked) => {
                        onCreditOverrideChange(
                          item.key,
                          Boolean(checked),
                          item.utilityWeight
                        )
                      }}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-semibold text-foreground",
                            !item.enabled &&
                              "text-muted-foreground line-through"
                          )}
                        >
                          {item.credit.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[9px] font-normal"
                        >
                          {frequencyLabel}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">
                        {item.credit.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Face Value + Utility Slider + Effective Value */}
                  <div className="flex shrink-0 items-center gap-4 pl-7 sm:pl-0">
                    {/* Utility Weight Adjustment */}
                    <div className="flex w-28 flex-col items-end gap-1">
                      <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
                        <span>Utility</span>
                        <span className="font-mono font-bold text-foreground">
                          {item.enabled
                            ? `${Math.round(item.utilityWeight * 100)}%`
                            : "0%"}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={10}
                        disabled={!item.enabled}
                        value={[
                          item.enabled
                            ? Math.round(item.utilityWeight * 100)
                            : 0,
                        ]}
                        onValueChange={(val) => {
                          const num = Array.isArray(val)
                            ? val[0]
                            : (val as number)
                          onCreditOverrideChange(item.key, num > 0, num / 100)
                        }}
                        className="w-full cursor-pointer py-1"
                      />
                    </div>

                    {/* Calculated Dollar Value */}
                    <div className="w-16 text-right">
                      <div className="text-[10px] text-muted-foreground">
                        ${item.credit.amount} face
                      </div>
                      <div
                        className={cn(
                          "font-mono text-sm font-bold",
                          item.effectiveValue > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      >
                        ${item.effectiveValue}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-center">
          <CardIcon className="size-8 text-muted-foreground/50" />
          <div className="text-sm font-semibold text-foreground">
            No Statement Credits on {card.name}
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            This card does not use coupon-book statement credits to offset its
            annual fee. Its return is driven purely by point multipliers and
            perks.
          </p>
        </div>
      )}
    </div>
  )
}
