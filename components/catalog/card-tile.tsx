"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift } from "lucide-react"

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

// Format top rate badge
function getTopMultiplier(card: CreditCard): string {
  if (card.multipliers) {
    if (card.multipliers.top_category) {
      return "5% Top Category"
    }
    if (card.multipliers.rotating) {
      return "5% Rotating"
    }
  }

  const rateLabels: Record<string, string> = {
    travel_portal: "Travel",
    flights: "Flights",
    hotels: "Hotels",
    dining: "Dining",
    groceries: "Groceries",
    gas: "Gas",
    transit: "Transit",
    streaming: "Streaming",
    catch_all: "Base",
  }

  let topLabel = ""
  let topRate = 0

  if (card.rates) {
    const priorityCategories = [
      "travel_portal",
      "flights",
      "hotels",
      "dining",
      "groceries",
      "gas",
      "transit",
      "streaming",
    ]

    for (const key of priorityCategories) {
      const val = card.rates[key]
      if (typeof val === "number" && val > topRate && rateLabels[key]) {
        topRate = val
        topLabel = `${val}x ${rateLabels[key]}`
      }
    }

    Object.entries(card.rates).forEach(([key, val]) => {
      if (
        typeof val === "number" &&
        val > topRate &&
        key !== "catch_all" &&
        rateLabels[key]
      ) {
        topRate = val
        topLabel = `${val}x ${rateLabels[key]}`
      }
    })
  }

  if (topRate > 1 && topLabel) {
    return topLabel
  }

  const base = card.rates?.catch_all || 1
  return `${base}x Everything`
}

export function CardTile({ card, onSelect }: CardTileProps) {
  const issuerStyle = getIssuerStyle(card.issuer)

  // 3 Essential Metrics Badges
  const annualFeeBadge =
    card.annualFee === 0 ? "$0 Fee" : `$${card.annualFee}/yr`
  const topMultiplierBadge = getTopMultiplier(card)
  const bonusBadge =
    card.signupBonus && card.signupBonus.estimatedValueUsd > 0
      ? `$${card.signupBonus.estimatedValueUsd.toLocaleString()} Bonus`
      : card.rewardProgram?.currency === "cash_back"
        ? "Cash Back"
        : card.rewardProgram?.currency
          ? card.rewardProgram.currency.charAt(0).toUpperCase() +
            card.rewardProgram.currency.slice(1)
          : "Points"

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
          {/* Top Row: Issuer & Tier text */}
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              {card.issuer}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {card.tier}
            </span>
          </div>

          {/* Card Title */}
          <h3 className="font-heading text-base leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
            {card.name}
          </h3>

          {/* 3 Essential Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {/* 1. Annual Fee */}
            <Badge
              variant="outline"
              className="border-border/80 bg-background/80 font-mono text-xs font-semibold text-foreground"
            >
              {annualFeeBadge}
            </Badge>

            {/* 2. Top Multiplier */}
            <Badge
              variant="secondary"
              className="bg-secondary/90 font-mono text-xs font-semibold text-foreground"
            >
              {topMultiplierBadge}
            </Badge>

            {/* 3. Bonus Value or Reward Currency */}
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              {bonusBadge}
            </Badge>
          </div>
        </CardHeader>

        {/* Card Content: Welcome Bonus Info */}
        <CardContent className="px-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-2.5 transition-colors group-hover:bg-muted/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Gift className="size-3.5 shrink-0 text-primary" />
              <span className="line-clamp-1">
                {card.signupBonus.amount} {formatBonusUnit(card.signupBonus.unit)}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              Spend ${card.signupBonus.spendRequirement.toLocaleString()} in{" "}
              {card.signupBonus.timeframeMonths} mos
            </p>
          </div>
        </CardContent>
      </div>

      {/* Card Footer */}
      <CardFooter className="mt-2 flex items-center justify-between gap-2 border-t bg-muted/20 px-4 py-3">
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
