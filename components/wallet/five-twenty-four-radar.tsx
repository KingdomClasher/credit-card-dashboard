"use client"

import * as React from "react"
import { FiveTwentyFourStatus } from "@/lib/types/wallet"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FiveTwentyFourRadarProps {
  status: FiveTwentyFourStatus
}

export function FiveTwentyFourRadar({ status }: FiveTwentyFourRadarProps) {
  const [showRulesExplainer, setShowRulesExplainer] = React.useState(false)

  const {
    count,
    slotsRemaining,
    isUnderLimit,
    nextDropOffDate,
    formattedDropOff,
    daysUntilNextDropOff,
    cardsInWindow,
  } = status

  // Determine color theme based on 5/24 count
  const statusColor = isUnderLimit
    ? count <= 2
      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
      : "text-amber-500 border-amber-500/20 bg-amber-500/10"
    : "text-rose-500 border-rose-500/20 bg-rose-500/10"

  const ringStrokeColor = isUnderLimit
    ? count <= 2
      ? "#10b981" // emerald-500
      : "#f59e0b" // amber-500
    : "#f43f5e" // rose-500

  // 5 total slots visual array
  const slots = Array.from({ length: 5 }, (_, i) => {
    const entry = cardsInWindow[i] || null
    return {
      slotIndex: i + 1,
      isOccupied: Boolean(entry),
      entry,
    }
  })

  // SVG Gauge calculations (radius = 70, circumference = 2 * PI * 70 = 439.82)
  const radius = 64
  const circumference = 2 * Math.PI * radius
  // Maximum gauge representation is capped at 5 for the primary ring
  const percentage = Math.min(1, count / 5)
  const strokeDashoffset = circumference - percentage * circumference

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      {/* Subtle background glow */}
      <div
        className={cn(
          "pointer-events-none absolute -top-20 -right-20 size-64 rounded-full opacity-15 blur-3xl",
          isUnderLimit ? "bg-emerald-500" : "bg-rose-500"
        )}
      />

      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border",
                statusColor
              )}
            >
              {isUnderLimit ? (
                <ShieldCheck className="size-4" />
              ) : (
                <ShieldAlert className="size-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                Chase 5/24 Radar
              </CardTitle>
              <CardDescription className="text-xs">
                Rolling 24-month credit card application pacing
              </CardDescription>
            </div>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "px-2.5 py-1 text-xs font-semibold tracking-wide uppercase",
            statusColor
          )}
        >
          {count}/24 •{" "}
          {isUnderLimit ? `${slotsRemaining} Slots Open` : "Limit Reached"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Main Gauge & Status Summary Banner */}
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          {/* Radial Progress Gauge */}
          <div className="flex flex-col items-center justify-center md:col-span-5">
            <div className="relative flex size-44 items-center justify-center">
              <svg
                className="size-full -rotate-90 transform"
                viewBox="0 0 160 160"
              >
                {/* Background track circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-muted/40"
                />
                {/* 5 Tick marks representing each of the 5 slots */}
                {[0, 1, 2, 3, 4].map((idx) => {
                  const angle = (idx / 5) * 360 - 90
                  const rad = (angle * Math.PI) / 180
                  const x1 = 80 + (radius - 8) * Math.cos(rad)
                  const y1 = 80 + (radius - 8) * Math.sin(rad)
                  const x2 = 80 + (radius + 8) * Math.cos(rad)
                  const y2 = 80 + (radius + 8) * Math.sin(rad)
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-background"
                    />
                  )
                })}
                {/* Animated colored progress stroke */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={ringStrokeColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Metrics Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-heading text-3xl font-extrabold tracking-tight">
                  {count}
                  <span className="text-xl font-medium text-muted-foreground">
                    /24
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold tracking-wider uppercase",
                    isUnderLimit
                      ? count <= 2
                        ? "text-emerald-500"
                        : "text-amber-500"
                      : "text-rose-500"
                  )}
                >
                  {isUnderLimit ? `${slotsRemaining} open` : "Ineligible"}
                </span>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              {isUnderLimit
                ? `${slotsRemaining} application ${slotsRemaining === 1 ? "slot" : "slots"} remaining before 5/24 lock`
                : "Application approvals locked until next drop-off"}
            </p>
          </div>

          {/* Next Drop-off Countdown Banner */}
          <div className="flex flex-col justify-center space-y-3 md:col-span-7">
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                isUnderLimit
                  ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20"
                  : "border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Next Slot Unlocks
                  </span>
                </div>
                {daysUntilNextDropOff !== null && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-semibold"
                  >
                    {daysUntilNextDropOff === 0
                      ? "Today"
                      : `${daysUntilNextDropOff} days left`}
                  </Badge>
                )}
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  {formattedDropOff}
                </span>
                {nextDropOffDate && (
                  <span className="text-xs text-muted-foreground">
                    ({nextDropOffDate})
                  </span>
                )}
              </div>

              {cardsInWindow.length > 0 ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Next drop-off card:{" "}
                  </span>
                  {cardsInWindow[0].catalogCard?.name ||
                    cardsInWindow[0].card.nickname ||
                    cardsInWindow[0].card.cardSlug}{" "}
                  <span className="text-muted-foreground">
                    (opened {cardsInWindow[0].openedDate})
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  No cards opened within the rolling 24 months. You have all 5
                  Chase slots open!
                </p>
              )}
            </div>

            {/* Quick Strategy Status */}
            <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3 text-xs">
              {isUnderLimit ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
              )}
              <div className="space-y-0.5 text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {isUnderLimit
                    ? "Safe to Apply for Chase Cards"
                    : "Prioritize Non-Chase Cards or Wait"}
                </span>
                <p>
                  {isUnderLimit
                    ? `You can safely apply for Chase cards like Sapphire Preferred, Ink Business, or Freedom Flex without auto-denials.`
                    : `Chase will automatically decline applications. Wait until ${formattedDropOff} or explore business cards that bypass personal credit reports.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Slot Visual Breakdown */}
        <div className="space-y-2.5 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Your 5/24 Slots Breakdown
            </span>
            <span className="text-xs text-muted-foreground">
              {count} of 5 slots utilized
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {slots.map(({ slotIndex, isOccupied, entry }) => (
              <div
                key={slotIndex}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-3 text-xs transition-all",
                  isOccupied
                    ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                    : "border-dashed border-border/80 bg-muted/20 text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    SLOT #{slotIndex}
                  </span>
                  {isOccupied ? (
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 px-1 py-0 text-[9px] font-medium text-primary"
                    >
                      Filled
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 px-1 py-0 text-[9px] font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      Open
                    </Badge>
                  )}
                </div>

                <div className="my-2 min-h-11">
                  {isOccupied && entry ? (
                    <div className="space-y-1">
                      <p className="line-clamp-2 font-semibold text-foreground">
                        {entry.catalogCard?.name ||
                          entry.card.nickname ||
                          entry.card.cardSlug}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Opened: {entry.openedDate}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center py-1 text-center">
                      <Sparkles className="size-3.5 text-emerald-500" />
                      <span className="mt-1 text-[11px] font-medium text-foreground">
                        Available Slot
                      </span>
                    </div>
                  )}
                </div>

                {isOccupied && entry ? (
                  <div className="border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground">
                    <span>Drops off: </span>
                    <span className="font-medium text-foreground">
                      {entry.dropOffMonthYear}
                    </span>
                  </div>
                ) : (
                  <div className="border-t border-border/40 pt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    Ready for approval
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cards opened past 5 limit if any */}
          {cardsInWindow.length > 5 && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400">
              <span className="font-semibold">Notice:</span> You have{" "}
              {cardsInWindow.length - 5} additional card(s) opened within 24
              months beyond the 5 slots. Total opened in 24 months:{" "}
              {cardsInWindow.length}/24.
            </div>
          )}
        </div>

        {/* Educational Explainer Collapsible */}
        <div className="rounded-xl border border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={() => setShowRulesExplainer(!showRulesExplainer)}
            className="flex w-full items-center justify-between p-3 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Info className="size-3.5 text-primary" />
              <span>How does the Chase 5/24 Rule work?</span>
            </div>
            {showRulesExplainer ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {showRulesExplainer && (
            <div className="space-y-3 border-t border-border/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">The Rule:</strong> If you
                have opened{" "}
                <span className="font-semibold text-foreground">
                  5 or more personal credit cards
                </span>{" "}
                across <em className="italic">any bank</em> (Chase, Amex,
                Capital One, Citi, etc.) in the past 24 rolling months, Chase
                will automatically deny your application for almost all Chase
                credit cards, regardless of your credit score or income.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ What DOES NOT count:
                  </span>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px]">
                    <li>
                      Most small business credit cards (Chase Ink, Amex
                      Business)
                    </li>
                    <li>Cards opened more than 24 calendar months ago</li>
                    <li>Auto loans, mortgages, and student loans</li>
                  </ul>
                </div>
                <div className="rounded-lg border bg-background/50 p-2.5">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ✗ What DOES count:
                  </span>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px]">
                    <li>All personal credit cards from any US bank</li>
                    <li>
                      Store retail cards linked to Visa/Mastercard networks
                    </li>
                    <li>
                      Authorized user accounts (though can be appealed via
                      phone)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
