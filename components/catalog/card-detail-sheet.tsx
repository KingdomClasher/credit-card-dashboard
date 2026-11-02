"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/lib/hooks/use-wallet"
import Link from "next/link"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Star,
  Gift,
  DollarSign,
  Globe,
  Coins,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Check,
  Info,
  Plus,
  ShieldCheck,
  Plane,
  Smartphone,
  ArrowRightLeft,
} from "lucide-react"

interface CategorizedPerks {
  travel: string[]
  insurance: string[]
  purchase: string[]
  general: string[]
}

function categorizePerks(perks: string[]): CategorizedPerks {
  const result: CategorizedPerks = {
    travel: [],
    insurance: [],
    purchase: [],
    general: [],
  }

  perks.forEach((perk) => {
    const p = perk.toLowerCase()
    if (
      p.includes("cdw") ||
      p.includes("collision") ||
      p.includes("rental") ||
      p.includes("cancellation") ||
      p.includes("interruption") ||
      p.includes("delay") ||
      p.includes("luggage") ||
      p.includes("baggage") ||
      p.includes("accident") ||
      p.includes("evacuation") ||
      p.includes("insurance") ||
      p.includes("roadside")
    ) {
      result.insurance.push(perk)
    } else if (
      p.includes("lounge") ||
      p.includes("priority pass") ||
      p.includes("centurion") ||
      p.includes("sky club") ||
      p.includes("united club") ||
      p.includes("tsa") ||
      p.includes("global entry") ||
      p.includes("nexus") ||
      p.includes("free night") ||
      p.includes("companion") ||
      p.includes("elite night") ||
      p.includes("tqps")
    ) {
      result.travel.push(perk)
    } else if (
      p.includes("cell phone") ||
      p.includes("warranty") ||
      p.includes("purchase protection") ||
      p.includes("return protection") ||
      p.includes("fraud")
    ) {
      result.purchase.push(perk)
    } else {
      result.general.push(perk)
    }
  })

  return result
}

interface CardDetailSheetProps {
  card: CreditCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardDetailSheet({
  card,
  open,
  onOpenChange,
}: CardDetailSheetProps) {
  const { cards, addCard } = useWallet()
  const isAlreadyInWallet = card
    ? cards.some((c) => c.cardSlug === card.id)
    : false
  const [justAdded, setJustAdded] = React.useState(false)

  const categorizedPerks = React.useMemo(() => {
    return card
      ? categorizePerks(card.perks || [])
      : { travel: [], insurance: [], purchase: [], general: [] }
  }, [card])

  const fullText = React.useMemo(() => {
    if (!card) return ""
    return [
      ...(card.perks || []),
      ...(card.credits?.map((c) => c.name + " " + c.description) || []),
    ]
      .join(" ")
      .toLowerCase()
  }, [card])

  if (!card) return null

  const handleAddToWallet = () => {
    if (!card) return
    const today = new Date().toISOString().split("T")[0]
    addCard({
      cardSlug: card.id,
      nickname: card.name,
      openedDate: today,
      annualFee: card.annualFee,
      trackMSR: true,
      targetSpend: card.signupBonus?.spendRequirement || 0,
      currentSpend: 0,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 3000)
  }

  // Calculate annual total of statement credits
  const totalAnnualCredits =
    card.credits?.reduce((sum, item) => {
      if (item.frequency === "monthly") return sum + item.amount * 12
      if (item.frequency === "semi-annual") return sum + item.amount * 2
      if (item.frequency === "annual") return sum + item.amount
      if (item.frequency === "every_4_years")
        return sum + Math.round(item.amount / 4)
      return sum + item.amount
    }, 0) || 0

  const netEffectiveFee = card.annualFee - totalAnnualCredits

  const hasLounge =
    /lounge|priority pass|centurion|united club|sky club|plaza premium/.test(
      fullText
    )
  const hasPrimaryCdw = /primary.*(cdw|auto|collision|car rental)/i.test(
    fullText
  )
  const hasCellPhone = /cell phone/i.test(fullText)
  const hasGlobalEntry = /global entry|tsa precheck|nexus/i.test(fullText)
  const hasFreeNight = /free night|anniversary night/i.test(fullText)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto border-l p-0 data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl"
      >
        {/* Sticky Header Banner */}
        <SheetHeader className="sticky top-0 z-10 border-b bg-background/95 p-6 pb-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold">
                {card.issuer}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {card.tier}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {card.network}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Star className="size-3.5 fill-current" />
              <span>{card.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <SheetTitle className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground">
            {card.name}
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
            Credit Score:{" "}
            <span className="font-medium text-foreground">
              {card.creditScoreRequired}
            </span>
          </SheetDescription>

          {/* Quick Metrics KPI Bar */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 sm:grid-cols-4">
            {/* Annual Fee */}
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                Annual Fee
              </div>
              <div className="font-mono text-base font-bold text-foreground">
                ${card.annualFee}
              </div>
              <div className="text-[10px] text-muted-foreground">
                AU:{" "}
                {card.authorizedUserFee > 0
                  ? `$${card.authorizedUserFee}`
                  : "$0"}
              </div>
            </div>

            {/* Foreign Tx Fee */}
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                Foreign Tx Fee
              </div>
              <div className="font-mono text-base font-bold text-foreground">
                {card.foreignTransactionFee.rate}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {card.foreignTransactionFee.hasFee ? "Fee applies" : "No FTF"}
              </div>
            </div>

            {/* Point Currency */}
            <div className="rounded-lg bg-muted/50 p-2.5">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                Ecosystem
              </div>
              <div className="line-clamp-1 text-xs font-bold text-foreground">
                {card.rewardProgram.name.replace("American Express ", "Amex ")}
              </div>
              <div className="text-[10px] text-muted-foreground">
                ~{card.rewardProgram.estimatedCpp}¢ / pt
              </div>
            </div>

            {/* Welcome Bonus Value */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 dark:bg-emerald-500/20">
              <div className="text-[10px] font-semibold text-emerald-800 uppercase dark:text-emerald-300">
                Bonus Value
              </div>
              <div className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-300">
                ${card.signupBonus.estimatedValueUsd}
              </div>
              <div className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
                Est. Return
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Body Content */}
        <div className="space-y-6 p-6">
          {/* 1. Welcome Bonus Breakdown */}
          <div className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="size-4 text-primary" />
                <h4 className="font-heading text-sm font-semibold text-foreground">
                  Welcome Bonus Offer
                </h4>
              </div>
              {card.signupBonus.historicalHigh && (
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground"
                >
                  High: {card.signupBonus.historicalHigh}
                </Badge>
              )}
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-sm font-bold text-foreground">
                {card.signupBonus.amount} {card.signupBonus.unit}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {card.signupBonus.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="size-3.5 text-primary" />
                <span>
                  Spend Req:{" "}
                  <strong className="text-foreground">
                    ${card.signupBonus.spendRequirement.toLocaleString()}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>
                  Timeframe:{" "}
                  <strong className="text-foreground">
                    {card.signupBonus.timeframeMonths} months
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Est. Value:{" "}
                  <strong className="text-foreground">
                    ${card.signupBonus.estimatedValueUsd}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Rewards & Multipliers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Coins className="size-4 text-primary" />
                Category Multipliers
              </h4>
              <span className="text-xs text-muted-foreground">
                Points per $1 spent
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(card.multipliers).map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-start gap-2.5 rounded-lg border bg-card p-2.5 text-xs"
                >
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="leading-snug text-muted-foreground">
                    <span className="font-medium text-foreground">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recurring Statement Credits Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <DollarSign className="size-4 text-primary" />
                Itemized Recurring Statement Credits
              </h4>
              {card.credits && card.credits.length > 0 && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-medium"
                >
                  {card.credits.length} credits available
                </Badge>
              )}
            </div>

            {card.credits && card.credits.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-xs font-semibold">
                        Credit Benefit
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold">
                        Value
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Cadence
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {card.credits.map((credit, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">
                          <div className="font-medium text-foreground">
                            {credit.name}
                          </div>
                          <div className="line-clamp-1 text-[11px] text-muted-foreground">
                            {credit.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                          ${credit.amount}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">
                          {credit.frequency.replace(/_/g, " ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-muted/70">
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-xs font-bold text-foreground"
                      >
                        Total Potential Annual Credits:
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                        ${totalAnnualCredits}/yr
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-xs text-muted-foreground"
                      >
                        Net Holding Cost (Annual Fee minus Credits):
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold">
                        <span
                          className={
                            netEffectiveFee <= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }
                        >
                          {netEffectiveFee <= 0
                            ? `+$${Math.abs(netEffectiveFee)} gain`
                            : `$${netEffectiveFee}/yr`}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                No complex recurring coupon credits. Straightforward value
                without breakage risk.
              </div>
            )}
          </div>

          {/* 4. Reward Program & Transfer Partners */}
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Globe className="size-4 text-primary" />
                Point Currency & Transfer Ecosystem
              </h4>
              {card.rewardProgram.transferable && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/30 bg-primary/10 text-[11px] font-medium text-primary"
                >
                  <ArrowRightLeft className="size-3" />
                  1:1 Transfer Enabled
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-2">
                <span className="block text-[10px] text-muted-foreground">
                  Program
                </span>
                <span className="font-medium text-foreground">
                  {card.rewardProgram.name}
                </span>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <span className="block text-[10px] text-muted-foreground">
                  Transferable
                </span>
                <span className="font-medium text-foreground">
                  {card.rewardProgram.transferable
                    ? "Yes (1:1 Partners)"
                    : "No (Fixed Cash Back)"}
                </span>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <span className="block text-[10px] text-muted-foreground">
                  Valuation Range
                </span>
                <span className="font-medium text-foreground">
                  {card.rewardProgram.cashFloorCpp}¢ –{" "}
                  {card.rewardProgram.estimatedCpp}¢ / pt
                </span>
              </div>
            </div>

            {card.rewardProgram.topPartners &&
              card.rewardProgram.topPartners.length > 0 && (
                <div className="space-y-1.5 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      1:1 Airline & Hotel Transfer Partners ({card.rewardProgram.topPartners.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Transfer for maximum redemption value
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.rewardProgram.topPartners.map((partner) => (
                      <Badge
                        key={partner}
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* 5. Underwriting Policy Warnings */}
          <div className="space-y-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 dark:bg-amber-500/10">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="size-4 shrink-0" />
              <h4 className="font-heading text-sm font-semibold">
                Underwriting & Eligibility Rules
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Review bank application rules before submitting to avoid hard
              credit inquiries with automatic rejections:
            </p>
            <div className="space-y-2 pt-1">
              {card.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg border bg-background/80 p-2.5 text-xs text-foreground"
                >
                  <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Key Perks, Protections & Secondary Details */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h4 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Card Perks, Protections & Secondary Details
              </h4>
              <p className="text-xs text-muted-foreground">
                Comprehensive overview of travel insurance coverage, airport lounge access, purchase protections, and foreign fee waivers.
              </p>
            </div>

            {/* Quick Privileges Badge Strip */}
            <div className="flex flex-wrap gap-1.5">
              {!card.foreignTransactionFee.hasFee ||
              card.foreignTransactionFee.rate === "0%" ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                >
                  <Globe className="size-3" />
                  0% Foreign Tx Fee
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-700 dark:text-amber-300"
                >
                  <Globe className="size-3" />
                  {card.foreignTransactionFee.rate} FTF
                </Badge>
              )}

              {hasLounge && (
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-500/30 bg-blue-500/10 text-[11px] font-medium text-blue-700 dark:text-blue-300"
                >
                  <Plane className="size-3" />
                  Airport Lounge Access
                </Badge>
              )}

              {hasPrimaryCdw && (
                <Badge
                  variant="outline"
                  className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-[11px] font-medium text-indigo-700 dark:text-indigo-300"
                >
                  <ShieldCheck className="size-3" />
                  Primary Auto Rental CDW
                </Badge>
              )}

              {hasCellPhone && (
                <Badge
                  variant="outline"
                  className="gap-1 border-purple-500/30 bg-purple-500/10 text-[11px] font-medium text-purple-700 dark:text-purple-300"
                >
                  <Smartphone className="size-3" />
                  Cell Phone Protection
                </Badge>
              )}

              {hasGlobalEntry && (
                <Badge
                  variant="outline"
                  className="gap-1 border-sky-500/30 bg-sky-500/10 text-[11px] font-medium text-sky-700 dark:text-sky-300"
                >
                  <Plane className="size-3" />
                  TSA / Global Entry Credit
                </Badge>
              )}

              {hasFreeNight && (
                <Badge
                  variant="outline"
                  className="gap-1 border-teal-500/30 bg-teal-500/10 text-[11px] font-medium text-teal-700 dark:text-teal-300"
                >
                  <Sparkles className="size-3" />
                  Free Night Award
                </Badge>
              )}

              {card.rewardProgram?.transferable && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/30 bg-primary/10 text-[11px] font-medium text-primary"
                >
                  <ArrowRightLeft className="size-3" />
                  1:1 Transfer Partners
                </Badge>
              )}
            </div>

            {/* Foreign Transaction Fee Detailed Callout */}
            {!card.foreignTransactionFee.hasFee ||
            card.foreignTransactionFee.rate === "0%" ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:bg-emerald-500/10">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Globe className="size-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    0% Foreign Transaction Fee Waiver
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This card waives all foreign transaction fees on international purchases, dining abroad, and overseas merchants (saving ~3% on every international swipe).
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Globe className="size-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">
                    Foreign Transaction Fee: {card.foreignTransactionFee.rate}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A {card.foreignTransactionFee.rate} fee applies on non-USD transactions. Consider pairing with a 0% FTF card for international travel.
                  </p>
                </div>
              </div>
            )}

            {/* Categorized Perks Blocks */}
            <div className="space-y-3">
              {/* Travel Insurance & Protections */}
              {categorizedPerks.insurance.length > 0 && (
                <div className="rounded-xl border bg-card p-3.5 shadow-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <h5 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                      Travel Insurance & Trip Protections
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {categorizedPerks.insurance.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="leading-relaxed text-foreground/90">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Airport Lounge & Travel Privileges */}
              {categorizedPerks.travel.length > 0 && (
                <div className="rounded-xl border bg-card p-3.5 shadow-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <Plane className="size-4 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                      Airport & Travel Privileges
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {categorizedPerks.travel.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className="leading-relaxed text-foreground/90">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase & Device Protections */}
              {categorizedPerks.purchase.length > 0 && (
                <div className="rounded-xl border bg-card p-3.5 shadow-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <Smartphone className="size-4 text-purple-600 dark:text-purple-400" />
                    <h5 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                      Purchase, Warranty & Device Protection
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {categorizedPerks.purchase.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                        <span className="leading-relaxed text-foreground/90">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General / Additional Privileges */}
              {categorizedPerks.general.length > 0 && (
                <div className="rounded-xl border bg-card p-3.5 shadow-xs">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <h5 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                      Additional Privileges & Partner Benefits
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {categorizedPerks.general.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="leading-relaxed text-foreground/90">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 7. Editorial Verdict & Pros/Cons */}
          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                Editorial Verdict
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground">
                {card.summary}
              </p>
            </div>

            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-[11px] font-semibold text-foreground">
                Best For:
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {card.bestFor}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t pt-2 text-xs sm:grid-cols-2">
              {/* Pros */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  The Pros
                </div>
                <div className="space-y-1.5">
                  {card.pros.map((pro, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 leading-snug text-muted-foreground"
                    >
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        •
                      </span>
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                  <XCircle className="size-3.5" />
                  The Cons
                </div>
                <div className="space-y-1.5">
                  {card.cons.map((con, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 leading-snug text-muted-foreground"
                    >
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        •
                      </span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isAlreadyInWallet || justAdded ? (
              <Badge
                variant="secondary"
                className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3.5" />
                <span>In My Wallet</span>
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleAddToWallet}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Plus className="size-4" />
                <span>Add to My Wallet</span>
              </Button>
            )}
            {(isAlreadyInWallet || justAdded) && (
              <Link
                href="/wallet"
                className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80"
              >
                View in Wallet &rarr;
              </Link>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
