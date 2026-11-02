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

interface FlatRuleItem extends RuleDetail {
  bankName: string
  bankId: string
  logoShort: string
  logoStyle: {
    border: string
    badge: string
    text: string
  }
}

export function IssuerRulesRadar({ summary, onSelectTab }: IssuerRulesRadarProps) {
  const [filter, setFilter] = React.useState<FilterMode>("all")
  const [expandedRuleIds, setExpandedRuleIds] = React.useState<Set<string>>(new Set())

  const toggleRuleExpanded = (ruleId: string) => {
    setExpandedRuleIds((prev) => {
      const next = new Set(prev)
      if (next.has(ruleId)) {
        next.delete(ruleId)
      } else {
        next.add(ruleId)
      }
      return next
    })
  }

  const { banks } = summary

  // Flatten all rules across all 6 banks into a single list
  const allRules: FlatRuleItem[] = React.useMemo(() => {
    return banks.flatMap((bank) =>
      bank.rules.map((rule) => ({
        ...rule,
        bankName: bank.issuerName,
        bankId: bank.issuerId,
        logoShort: bank.logoShort,
        logoStyle: bank.logoStyle,
      }))
    )
  }, [banks])

  const cooldownCount = React.useMemo(() => {
    return allRules.filter((r) => r.cooldownActive || r.status === "warning" || r.status === "locked").length
  }, [allRules])

  const readyCount = React.useMemo(() => {
    return allRules.filter((r) => r.status === "eligible" && !r.cooldownActive).length
  }, [allRules])

  const filteredRules = React.useMemo(() => {
    if (filter === "cooldown") {
      return allRules.filter(
        (r) => r.cooldownActive || r.status === "warning" || r.status === "locked"
      )
    }
    if (filter === "ready") {
      return allRules.filter((r) => r.status === "eligible" && !r.cooldownActive)
    }
    return allRules
  }, [allRules, filter])

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Issuer Rules & Application Velocity Ledger
            </h2>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              6 Banks • {allRules.length} Rules
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            Complete list of underwriting constraints, cooldown timers, and approval velocity across all major issuers.
          </p>
        </div>

        {/* Filter Pills and Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border bg-muted/40 p-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="h-7 text-xs font-medium"
            >
              All Rules ({allRules.length})
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
              Active Cooldowns ({cooldownCount})
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
              Ready to Apply ({readyCount})
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

      {/* Row Ledger List */}
      <div className="space-y-2.5">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleIds.has(rule.id)
          const isCooldown = rule.cooldownActive || rule.status === "warning"
          const isLocked = rule.status === "locked"

          return (
            <div
              key={rule.id}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs",
                isCooldown
                  ? "border-amber-500/30 bg-amber-500/[0.03] hover:bg-amber-500/[0.06]"
                  : isLocked
                  ? "border-rose-500/30 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]"
                  : "border-border/60 bg-card/60 hover:bg-card/90"
              )}
            >
              <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Status Dot + Rule Name + Bank Tag + 1-line Description */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-1.5 shrink-0">
                    {isCooldown ? (
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex size-2.5 rounded-full bg-rose-500" />
                    ) : (
                      <span className="inline-flex size-2.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-bold tracking-tight text-foreground">
                        {rule.name}
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold border",
                          rule.logoStyle.badge
                        )}
                      >
                        {rule.bankName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {rule.description}
                    </p>
                  </div>
                </div>

                {/* Right: Numerical Standing / Countdown + Badge + Contributing Cards Toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="min-w-0 sm:min-w-[160px] text-left sm:text-right font-mono shrink-0 whitespace-nowrap">
                    {isCooldown ? (
                      <div>
                        <span className="font-bold text-amber-600 dark:text-amber-300 whitespace-nowrap">
                          {rule.daysRemaining && rule.daysRemaining <= 90
                            ? `${rule.daysRemaining} days left`
                            : rule.monthsRemaining
                            ? `${rule.monthsRemaining} months left`
                            : "In Cooldown"}
                        </span>
                        {rule.unlockFormatted && (
                          <div className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">
                            Unlocks {rule.unlockFormatted}
                          </div>
                        )}
                      </div>
                    ) : rule.currentCount !== undefined && rule.maxLimit !== undefined ? (
                      <div>
                        <span className="font-bold text-foreground whitespace-nowrap">
                          {rule.currentCount} / {rule.maxLimit} Slots Used
                        </span>
                        {rule.unlockFormatted && (
                          <div className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">
                            Next drop-off: {rule.unlockFormatted}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Badge + Contributing Cards Toggle Group */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Status Badge */}
                    <div className="w-[95px] sm:w-[105px] shrink-0 flex items-center justify-end">
                      {isCooldown ? (
                        <Badge
                          variant="secondary"
                          className="w-full justify-center gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap"
                        >
                          <Clock className="size-3 shrink-0" />
                          <span>Cooldown</span>
                        </Badge>
                      ) : isLocked ? (
                        <Badge
                          variant="destructive"
                          className="w-full justify-center gap-1 text-xs font-semibold whitespace-nowrap"
                        >
                          <ShieldAlert className="size-3 shrink-0" />
                          <span>Locked</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="w-full justify-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>Ready</span>
                        </Badge>
                      )}
                    </div>

                    {/* Dedicated Expand Toggle Slot */}
                    <div className="w-8 shrink-0 flex items-center justify-center">
                      {rule.contributingCards.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleRuleExpanded(rule.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                          title="View contributing cards"
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      ) : (
                        <div className="size-7 hidden sm:block" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributing Portfolio Cards Drawer */}
              {isExpanded && rule.contributingCards.length > 0 && (
                <div className="border-t border-border/40 bg-muted/30 px-4 py-3 text-xs space-y-2 rounded-b-xl">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Portfolio Cards Triggering This Rule ({rule.contributingCards.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rule.contributingCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-2.5 py-1 text-xs shadow-2xs"
                      >
                        <span className="font-semibold text-foreground">{card.cardName}</span>
                        <span className="text-muted-foreground text-[11px]">
                          (opened {card.openedDate}
                          {card.bonusDate ? `, bonus ${card.bonusDate}` : ""})
                        </span>
                      </div>
                    ))}
                  </div>
                  {rule.recommendation && (
                    <p className="pt-1 text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-primary font-semibold">Advice: </strong>
                      {rule.recommendation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
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
  const { chase524, banks } = summary

  const activeCooldownRules = React.useMemo(() => {
    return banks.flatMap((b) =>
      b.rules
        .filter((r) => r.cooldownActive || r.status === "warning")
        .map((r) => ({ ...r, bankName: b.issuerName, logoStyle: b.logoStyle }))
    )
  }, [banks])

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Issuer Rules & Velocity Ledger
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Chase 5/24 status and active bank cooldown timers
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToRadar}
          className="h-8 gap-1.5 text-xs text-primary font-semibold hover:bg-primary hover:text-primary-foreground"
        >
          <span>View All Rules Ledger</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
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
            <span>
              {chase524.unlockFormatted
                ? `Next drop-off: ${chase524.unlockFormatted}`
                : "No drop-off pending"}
            </span>
          </div>
        </div>

        {/* Active Cooldown List Preview */}
        {activeCooldownRules.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Cooldowns ({activeCooldownRules.length})
            </div>
            <div className="space-y-1.5">
              {activeCooldownRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex size-2 shrink-0">
                      <span className="relative inline-flex size-2 rounded-full bg-amber-500 animate-pulse" />
                    </span>
                    <span className="font-semibold text-foreground truncate">{rule.name}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0",
                        rule.logoStyle.badge
                      )}
                    >
                      {rule.bankName}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    {rule.daysRemaining && rule.daysRemaining <= 90
                      ? `${rule.daysRemaining}d left`
                      : rule.monthsRemaining
                      ? `${rule.monthsRemaining}mo left`
                      : "In Cooldown"}
                    {rule.unlockFormatted && (
                      <div className="text-[10px] font-sans text-muted-foreground font-normal">
                        {rule.unlockFormatted}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>All bank velocity limits and bonus cooldowns are currently clear!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
