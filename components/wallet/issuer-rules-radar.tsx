"use client"

import * as React from "react"
import {
  IssuerRulesSummary,
  RuleDetail,
} from "@/lib/types/wallet"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface IssuerRulesRadarProps {
  summary: IssuerRulesSummary
  onSelectTab?: (tab: string) => void
}

type FilterMode = "all" | "cooldown" | "ready"

export function IssuerRulesRadar({ summary, onSelectTab }: IssuerRulesRadarProps) {
  const [filter, setFilter] = React.useState<FilterMode>("all")
  const [expandedBankIds, setExpandedBankIds] = React.useState<Set<string>>(new Set())

  const toggleBankExpanded = (issuerId: string) => {
    setExpandedBankIds((prev) => {
      const next = new Set(prev)
      if (next.has(issuerId)) {
        next.delete(issuerId)
      } else {
        next.add(issuerId)
      }
      return next
    })
  }

  const {
    banks,
    totalActiveCooldowns,
    readyToApplyBankCount,
    chase524,
    nextOverallUnlockFormatted,
  } = summary

  const filteredBanks = React.useMemo(() => {
    if (filter === "cooldown") {
      return banks.filter(
        (b) => b.overallStatus === "warning" || b.overallStatus === "locked"
      )
    }
    if (filter === "ready") {
      return banks.filter((b) => b.overallStatus === "eligible")
    }
    return banks
  }, [banks, filter])

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Issuer Rules & Application Velocity Radar
            </h2>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              6 Issuers Monitored
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            Standardized bank rule velocity limits, welcome bonus cooldowns, and churning underwriting criteria.
          </p>
        </div>

        {/* Filter Pills and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 p-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-7 text-xs font-medium"
            >
              All Issuers ({banks.length})
            </Button>
            <Button
              variant={filter === "cooldown" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("cooldown")}
              className={cn(
                "h-7 text-xs font-medium",
                filter === "cooldown"
                  ? "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600"
                  : "text-amber-600 dark:text-amber-400"
              )}
            >
              Active Cooldowns ({totalActiveCooldowns})
            </Button>
            <Button
              variant={filter === "ready" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("ready")}
              className={cn(
                "h-7 text-xs font-medium",
                filter === "ready"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              Ready to Apply ({readyToApplyBankCount})
            </Button>
          </div>

          {onSelectTab && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab("cards")}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Manage Cards</span>
              <ArrowRight className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card/60 p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Chase 5/24 Status
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-extrabold text-foreground">
              {chase524.currentCount ?? 0} / {chase524.maxLimit ?? 5}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ({chase524.slotsRemaining ?? 5} slots open)
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {chase524.unlockFormatted ? `Next drop-off: ${chase524.unlockFormatted}` : "No drop-off pending"}
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Active Cooldowns
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {totalActiveCooldowns}
            </span>
            <span className="text-xs text-muted-foreground">across all banks</span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {nextOverallUnlockFormatted ? `Next unlock: ${nextOverallUnlockFormatted}` : "All rules clear"}
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Clear to Apply
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {readyToApplyBankCount} / {banks.length}
            </span>
            <span className="text-xs text-muted-foreground">issuers</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
            Zero velocity restrictions
          </div>
        </div>

        <div className="rounded-xl border bg-card/60 p-3 shadow-2xs">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Catalog Coverage
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-extrabold text-primary">
              35 Cards
            </span>
            <span className="text-xs text-muted-foreground">premier options</span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            Includes BoA, Chase, Amex & more
          </div>
        </div>
      </div>

      {/* Grid of Bank Rule Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredBanks.map((bank) => {
          const isExpanded = expandedBankIds.has(bank.issuerId)

          return (
            <Card
              key={bank.issuerId}
              className={cn(
                "relative flex flex-col justify-between overflow-hidden border bg-card/80 transition-all duration-200",
                bank.logoStyle.border
              )}
            >
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl border font-mono text-xs font-bold shadow-xs",
                        bank.logoStyle.badge
                      )}
                    >
                      {bank.logoShort}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold tracking-tight text-foreground">
                        {bank.issuerName}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {bank.rules.length} Underwriting Rules Evaluated
                      </CardDescription>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {bank.overallStatus === "eligible" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Ready to Apply</span>
                      </Badge>
                    )}
                    {bank.overallStatus === "warning" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400"
                      >
                        <Clock className="size-3" />
                        <span>{bank.statusMessage}</span>
                      </Badge>
                    )}
                    {bank.overallStatus === "locked" && (
                      <Badge
                        variant="destructive"
                        className="gap-1 text-xs font-semibold"
                      >
                        <ShieldAlert className="size-3" />
                        <span>{bank.statusMessage}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 flex-1">
                {/* Standardized Rules List */}
                <div className="space-y-3">
                  {bank.rules.map((rule) => (
                    <RuleItemRow key={rule.id} rule={rule} />
                  ))}
                </div>

                {/* Churning Strategy Recommendation Box */}
                {bank.rules[0]?.recommendation && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground flex items-start gap-2.5">
                    <span className="text-primary text-base font-bold shrink-0">💡</span>
                    <div>
                      <span className="font-semibold text-primary">Strategic Advice: </span>
                      <span className="text-muted-foreground">{bank.rules[0].recommendation}</span>
                    </div>
                  </div>
                )}

                {/* Collapsible Underwriting Explainer */}
                <div className="border-t border-border/40 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleBankExpanded(bank.issuerId)}
                    className="flex w-full items-center justify-between py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>View Underwriting Criteria & Details</span>
                    {isExpanded ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                      {bank.rules.map((rule) => (
                        <div key={rule.id} className="border-b border-border/20 pb-1.5 last:border-b-0 last:pb-0">
                          <strong className="text-foreground">{rule.name}:</strong> {rule.description}
                          {rule.contributingCards.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              <span className="text-[10px] text-muted-foreground">Cards counting:</span>
                              {rule.contributingCards.map((c, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">
                                  {c.cardName} ({c.openedDate})
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function RuleItemRow({ rule }: { rule: RuleDetail }) {
  const isLocked = rule.status === "locked"
  const isWarning = rule.status === "warning"

  const progressColor = isLocked
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500"

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
      {/* Title & Metric Row */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{rule.name}</span>

        <div>
          {rule.currentCount !== undefined && rule.maxLimit !== undefined ? (
            <span className="font-mono font-bold text-foreground">
              {rule.currentCount} / {rule.maxLimit}
            </span>
          ) : rule.cooldownActive ? (
            <span className="badge badge-warning text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {rule.daysRemaining ? `${rule.daysRemaining}d cooldown` : "In Cooldown"}
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              Clear
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={cn("h-1.5 rounded-full transition-all duration-300", progressColor)}
          style={{ width: `${rule.progressPercent}%` }}
        />
      </div>

      {/* Bottom Subtitle / Countdown */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate max-w-[220px]">
          {rule.contributingCards.length > 0
            ? `${rule.contributingCards.length} card(s) counting`
            : "No active inquiries"}
        </span>

        <span className="font-mono shrink-0">
          {rule.unlockFormatted
            ? `Unlocks ${rule.unlockFormatted}`
            : rule.slotsRemaining !== undefined
            ? `${rule.slotsRemaining} slot(s) open`
            : "Eligible now"}
        </span>
      </div>
    </div>
  )
}

/**
 * Compact summary widget rendered inside the main Overview Dashboard tab
 */
export function IssuerVelocitySummaryWidget({
  summary,
  onNavigateToRadar,
}: {
  summary: IssuerRulesSummary
  onNavigateToRadar: () => void
}) {
  const { chase524, totalActiveCooldowns, readyToApplyBankCount, nextOverallUnlockFormatted } = summary

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Issuer Rules & Velocity Radar
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Multi-bank application pacing, Chase 5/24 status, and bonus cooldowns
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToRadar}
          className="h-8 gap-1.5 text-xs text-primary font-semibold hover:bg-primary hover:text-primary-foreground"
        >
          <span>View All 6 Issuers</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Chase 5/24 Quick Bar */}
        <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Chase 5/24 Rule</span>
            <span className="font-mono font-bold text-foreground">
              {chase524.currentCount ?? 0} / {chase524.maxLimit ?? 5} Slots Used
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-2 rounded-full",
                (chase524.currentCount ?? 0) >= 5
                  ? "bg-rose-500"
                  : (chase524.currentCount ?? 0) === 4
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${chase524.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{chase524.slotsRemaining ?? 5} Chase slots available</span>
            <span>{chase524.unlockFormatted ? `Next drop-off: ${chase524.unlockFormatted}` : "No drop-off pending"}</span>
          </div>
        </div>

        {/* 2 Key Stats Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border bg-muted/20 p-2.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">Active Cooldowns</div>
            <div className="mt-0.5 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
              {totalActiveCooldowns} {totalActiveCooldowns === 1 ? "Rule" : "Rules"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {nextOverallUnlockFormatted ? `Next: ${nextOverallUnlockFormatted}` : "All clear"}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-2.5">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">Clear to Apply</div>
            <div className="mt-0.5 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              {readyToApplyBankCount} of 6 Banks
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Unrestricted approval status
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
