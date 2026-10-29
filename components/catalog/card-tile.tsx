"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, Gift, Check } from "lucide-react"

interface CardTileProps {
  card: CreditCard
  onSelect: (card: CreditCard) => void
}

// Issuer accent styling
function formatBonusUnit(unit: string): string {
  if (!unit) return "pts"
  if (unit.includes("Chase UR") || unit.includes("UR")) return "UR"
  if (unit.includes("Amex MR") || unit.includes("MR")) return "MR"
  if (unit.includes("C1") || unit.includes("Capital One")) return "C1 Miles"
  if (unit.includes("Citi TYP") || unit.includes("TYP")) return "TYP"
  if (unit.includes("SkyMiles")) return "SkyMiles"
  if (unit.includes("AAdvantage")) return "AA Miles"
  if (unit.includes("MileagePlus")) return "UA Miles"
  if (unit.includes("Southwest")) return "SW pts"
  if (unit.includes("Hyatt")) return "Hyatt pts"
  if (unit.includes("Bonvoy") || unit.includes("Marriott")) return "Bonvoy pts"
  if (unit.includes("Hilton")) return "Hilton pts"
  if (unit.includes("IHG")) return "IHG pts"
  if (unit.includes("Bilt")) return "Bilt pts"
  if (unit.includes("cash") || unit.includes("Cash")) return "Cash Back"
  return unit
}

function getIssuerStyle(issuer: string) {
  const norm = issuer.toLowerCase()
  if (norm.includes("chase")) {
    return {
      border: "hover:border-blue-500/50 dark:hover:border-blue-400/50",
      badge:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    }
  }
  if (norm.includes("american express") || norm.includes("amex")) {
    return {
      border: "hover:border-amber-500/50 dark:hover:border-amber-400/50",
      badge:
        "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    }
  }
  if (norm.includes("capital one")) {
    return {
      border: "hover:border-red-500/50 dark:hover:border-red-400/50",
      badge:
        "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    }
  }
  if (norm.includes("citi")) {
    return {
      border: "hover:border-sky-500/50 dark:hover:border-sky-400/50",
      badge:
        "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    }
  }
  if (norm.includes("wells fargo")) {
    return {
      border: "hover:border-yellow-600/50 dark:hover:border-yellow-500/50",
      badge:
        "bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    }
  }
  if (norm.includes("bilt")) {
    return {
      border: "hover:border-zinc-500/50 dark:hover:border-zinc-400/50",
      badge:
        "bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
    }
  }
  if (norm.includes("discover")) {
    return {
      border: "hover:border-orange-500/50 dark:hover:border-orange-400/50",
      badge:
        "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    }
  }
  return {
    border: "hover:border-primary/50",
    badge: "bg-primary/10 text-primary border-primary/20",
  }
}

// Format top rate badges
function getTopMultipliers(card: CreditCard) {
  const items: { label: string; rate: number }[] = []

  const rateLabels: Record<string, string> = {
    dining: "Dining",
    groceries: "Groceries",
    flights: "Flights",
    hotels: "Hotels",
    travel_portal: "Portal",
    gas: "Gas",
    transit: "Transit",
    streaming: "Streaming",
    catch_all: "Base",
  }

  Object.entries(card.rates).forEach(([key, val]) => {
    if (typeof val === "number" && val > 1 && rateLabels[key]) {
      items.push({ label: `${val}x ${rateLabels[key]}`, rate: val })
    }
  })

  // Sort by rate descending
  items.sort((a, b) => b.rate - a.rate)

  if (items.length === 0) {
    const base = card.rates.catch_all || 1
    items.push({ label: `${base}x Everything`, rate: base })
  }

  return items.slice(0, 3)
}

// Extract top key perk chips
function getKeyPerks(card: CreditCard) {
  const chips: string[] = []

  // 1. FTF
  if (
    card.foreignTransactionFee.hasFee === false ||
    card.foreignTransactionFee.rate === "0%"
  ) {
    chips.push("0% FTF")
  }

  // 2. Lounge Access
  const fullText = [
    ...(card.perks || []),
    ...(card.credits?.map((c) => c.name + " " + c.description) || []),
  ].join(" ")

  if (/lounge|priority pass|centurion|united club|sky club/i.test(fullText)) {
    if (/priority pass/i.test(fullText)) chips.push("Priority Pass")
    else if (/centurion/i.test(fullText)) chips.push("Centurion Lounge")
    else chips.push("Lounge Access")
  }

  // 3. Free Night
  if (/free night|anniversary night|4th night free/i.test(fullText)) {
    chips.push("Free Night")
  }

  // 4. Primary CDW
  if (/primary.*(cdw|auto|collision|car rental)/i.test(fullText)) {
    chips.push("Primary CDW")
  }

  // 5. Global Entry
  if (/global entry|tsa precheck/i.test(fullText)) {
    chips.push("TSA/GE Credit")
  }

  // 6. Transfer Partners
  if (card.rewardProgram?.transferable) {
    chips.push("Transfer Partners")
  }

  return chips.slice(0, 3)
}

export function CardTile({ card, onSelect }: CardTileProps) {
  const issuerStyle = getIssuerStyle(card.issuer)
  const topMultipliers = getTopMultipliers(card)
  const keyPerks = getKeyPerks(card)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(card)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(card)
        }
      }}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${issuerStyle.border}`}
    >
      <div className="flex flex-col">
        {/* Card Header */}
        <CardHeader className="p-4 pb-2">
          {/* Top Row: Issuer & Tier Badge, Rating */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={`border text-[11px] font-medium ${issuerStyle.badge}`}
              >
                {card.issuer}
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] font-normal text-muted-foreground"
              >
                {card.tier}
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Star className="size-3.5 fill-current" />
              <span>{card.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Card Title & Fee */}
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="font-heading text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
              {card.name}
            </h3>

            {/* Prominent Annual Fee */}
            <div className="shrink-0 text-right">
              <div className="font-mono text-base leading-tight font-bold text-foreground">
                {card.annualFee === 0 ? "$0" : `$${card.annualFee}`}
              </div>
              <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                / year
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="space-y-3 px-4 py-2">
          {/* Welcome Bonus Banner */}
          <div className="rounded-lg border bg-muted/40 p-2.5 transition-colors group-hover:bg-muted/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Gift className="size-3.5 shrink-0 text-primary" />
                <span className="line-clamp-1">
                  {card.signupBonus.amount} {formatBonusUnit(card.signupBonus.unit)}
                </span>
              </div>
              <Badge
                variant="default"
                className="h-4 shrink-0 bg-emerald-600 px-1.5 py-0 text-[10px] font-bold text-white hover:bg-emerald-600 dark:bg-emerald-500"
              >
                ~${card.signupBonus.estimatedValueUsd} value
              </Badge>
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              Spend ${card.signupBonus.spendRequirement.toLocaleString()} in{" "}
              {card.signupBonus.timeframeMonths} mos
            </p>
          </div>

          {/* Top Multipliers */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Top Multipliers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topMultipliers.map((m) => (
                <Badge
                  key={m.label}
                  variant="secondary"
                  className="bg-secondary/80 px-2 py-0.5 font-mono text-xs font-medium text-foreground"
                >
                  {m.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Key Perks Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Key Perks
            </div>
            <div className="flex flex-wrap gap-1">
              {keyPerks.map((perk) => (
                <span
                  key={perk}
                  className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  <Check className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Card Footer */}
      <CardFooter className="mt-3 flex items-center justify-between gap-2 border-t bg-muted/20 px-4 py-3">
        <span className="font-mono text-[11px] text-muted-foreground">
          {card.network}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(card)
          }}
          className="group/btn h-8 gap-1.5 text-xs font-medium transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <span>View Details</span>
          <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
