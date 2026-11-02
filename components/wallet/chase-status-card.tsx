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
  Calendar,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChaseStatusCardProps {
  status: FiveTwentyFourStatus
}

export function ChaseStatusCard({ status }: ChaseStatusCardProps) {
  const [showExplainer, setShowExplainer] = React.useState(false)

  const {
    count,
    slotsRemaining,
    isUnderLimit,
    nextDropOffDate,
    formattedDropOff,
    daysUntilNextDropOff,
    cardsInWindow,
  } = status

  // Determine status tone: emerald (0-2), amber (3-4), rose (5+)
  const statusTheme = !isUnderLimit
    ? {
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        label: "5/24 Limit Reached (Ineligible for Chase)",
      }
    : count >= 4
    ? {
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        label: `Caution: Only ${slotsRemaining} Chase Slot Left`,
      }
    : {
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        label: `${slotsRemaining} of 5 Chase Slots Open`,
      }

  // Visual 5 slots representation
  const slots = Array.from({ length: 5 }, (_, i) => {
    const entry = cardsInWindow[i] || null
    return {
      slotIndex: i + 1,
      isOccupied: Boolean(entry),
      entry,
    }
  })

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl border mt-0.5",
              statusTheme.border,
              statusTheme.bg,
              statusTheme.text
            )}
          >
            {!isUnderLimit ? (
              <ShieldAlert className="size-5" />
            ) : count >= 4 ? (
              <AlertTriangle className="size-5" />
            ) : (
              <ShieldCheck className="size-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
                Chase 5/24 Timeline & Slot Pacing
              </CardTitle>
              <Badge variant="outline" className={cn("text-xs font-semibold", statusTheme.badge)}>
                {statusTheme.label}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Tracks personal cards opened across all banks in the rolling 24-month window (24 = 24 months, max 5 cards).
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-1">
        {/* Top Hero: Slot Usage & Next Drop-Off Countdown */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
          {/* Left: Slot Usage Summary */}
          <div className="flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                24-Month Slot Utilization
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {count} of 5
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Chase Slots Filled
                </span>
              </div>
            </div>

            {/* Segmented 5-Slot Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const isFilled = idx < count
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        isFilled
                          ? count >= 5
                            ? "bg-rose-500"
                            : count === 4
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-muted-foreground/20 border border-dashed border-border/80"
                      )}
                      title={`Slot ${idx + 1}: ${isFilled ? "Filled" : "Available"}`}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{count} personal cards in past 24 mos</span>
                <span>{slotsRemaining} slot{slotsRemaining === 1 ? "" : "s"} open</span>
              </div>
            </div>
          </div>

          {/* Right: Next Drop-Off Date Spotlight */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-lg border p-3 text-xs transition-colors",
              isUnderLimit
                ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20"
                : "border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Next Slot Unlocks</span>
              </div>
              {daysUntilNextDropOff !== null && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {daysUntilNextDropOff === 0
                    ? "Today"
                    : `${daysUntilNextDropOff} days left`}
                </Badge>
              )}
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {formattedDropOff}
                </span>
                {nextDropOffDate && (
                  <span className="text-[11px] text-muted-foreground">
                    ({nextDropOffDate})
                  </span>
                )}
              </div>
              {cardsInWindow.length > 0 ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Next aging card: </span>
                  {cardsInWindow[0].catalogCard?.name ||
                    cardsInWindow[0].card.nickname ||
                    cardsInWindow[0].card.cardSlug}{" "}
                  (opened {cardsInWindow[0].openedDate})
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  No cards opened within 24 months. All 5 Chase application slots are open!
                </p>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground">
              {isUnderLimit
                ? "Eligible for Chase personal & business card approvals."
                : `Chase auto-denies personal cards until ${formattedDropOff}. Business cards may be considered.`}
            </div>
          </div>
        </div>

        {/* 5-Slot Schedule Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              5-Slot Rolling Schedule
            </span>
            <span className="text-xs text-muted-foreground">
              {slotsRemaining} of 5 slots available for new Chase cards
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {slots.map(({ slotIndex, isOccupied, entry }) => (
              <div
                key={slotIndex}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-3 text-xs transition-all",
                  isOccupied
                    ? "border-primary/25 bg-primary/[0.03] hover:border-primary/40 shadow-2xs"
                    : "border-dashed border-border/80 bg-muted/20 text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    SLOT #{slotIndex}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold",
                      isOccupied
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {isOccupied ? "Occupied" : "Open"}
                  </span>
                </div>

                <div className="my-2 min-h-12">
                  {isOccupied && entry ? (
                    <div className="space-y-0.5">
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

                <div className="border-t border-border/40 pt-1.5 text-[10px]">
                  {isOccupied && entry ? (
                    <div className="text-muted-foreground">
                      <span>Drops off: </span>
                      <span className="font-semibold text-foreground">
                        {entry.dropOffMonthYear}
                      </span>
                      {entry.monthsRemaining > 0 && (
                        <span className="text-muted-foreground/80"> ({entry.monthsRemaining} mo)</span>
                      )}
                    </div>
                  ) : (
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">
                      Ready for application
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Alert if card count exceeds 5 slots */}
          {cardsInWindow.length > 5 && (
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Notice:</span> You have opened {cardsInWindow.length} personal cards in the last 24 months ({cardsInWindow.length - 5} beyond the 5-slot ceiling). You will need multiple drop-offs before returning under 5/24.
              </div>
            </div>
          )}
        </div>

        {/* Chronological Drop-Off Roadmap (if cards in window) */}
        {cardsInWindow.length > 0 && (
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span>Upcoming Slot Recovery Roadmap</span>
            </div>
            <div className="divide-y divide-border/40 text-xs">
              {cardsInWindow.map((entry, idx) => {
                const projectedCount = Math.max(0, count - (idx + 1))
                return (
                  <div
                    key={entry.card.id || idx}
                    className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-foreground">
                        {entry.catalogCard?.name || entry.card.nickname || entry.card.cardSlug}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        (opened {entry.openedDate})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end text-[11px]">
                      <span className="font-semibold text-foreground">
                        Drops off {entry.dropOffMonthYear}
                      </span>
                      <span className="text-muted-foreground">
                        - count becomes {projectedCount}/5
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Plain-English Educational Guide */}
        <div className="rounded-xl border border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="size-4 text-primary" />
              <span className="font-semibold text-foreground">
                How does the Chase 5/24 Rule work? (24 means 24 months, not 24 cards)
              </span>
            </div>
            {showExplainer ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {showExplainer && (
            <div className="space-y-3.5 border-t border-border/40 px-4 py-3.5 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">The Rule:</strong> If you have opened{" "}
                <span className="font-semibold text-foreground">5 or more personal credit cards</span>{" "}
                across <em className="italic">any bank</em> (Chase, American Express, Capital One, Citi, Wells Fargo, etc.) in the last{" "}
                <span className="font-semibold text-foreground">24 rolling months</span>, Chase will automatically deny your application for almost all Chase cards, regardless of your credit score or income.
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    <span>What DOES NOT count toward 5/24:</span>
                  </div>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px]">
                    <li>
                      Most small business cards (Chase Ink, Amex Business cards do not add to your personal 5/24 count)
                    </li>
                    <li>Cards opened more than 24 calendar months ago (they have aged out)</li>
                    <li>Auto loans, mortgages, personal loans, and student loans</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="size-3.5" />
                    <span>What DOES count toward 5/24:</span>
                  </div>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px]">
                    <li>All personal credit cards opened at any US bank</li>
                    <li>Store retail cards linked to Visa, Mastercard, or Amex networks</li>
                    <li>Authorized user accounts (can usually be appealed via Chase reconsideration line)</li>
                  </ul>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                <strong className="text-foreground">Strategy Tip:</strong> Prioritize opening valuable Chase cards (like Sapphire Preferred or Ink Business) before acquiring cards from other banks, because opening other cards consumes your limited Chase slots.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
