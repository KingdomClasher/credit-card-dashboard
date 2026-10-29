"use client"

import * as React from "react"
import { MSRTrackerItem } from "@/lib/types/wallet"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MSRTrackerCardProps {
  items: MSRTrackerItem[]
  onUpdateSpend: (id: string, newSpend: number) => void
  onAddSpendIncrement: (id: string, increment: number) => void
  onRemoveItem: (id: string) => void
  onAddNewMSR?: () => void
}

export function MSRTrackerCard({
  items,
  onUpdateSpend,
  onAddSpendIncrement,
  onRemoveItem,
  onAddNewMSR,
}: MSRTrackerCardProps) {
  // Track open spend increment popovers / inputs by item id
  const [activeInputId, setActiveInputId] = React.useState<string | null>(null)
  const [customSpendAmount, setCustomSpendAmount] = React.useState<string>("")

  const now = new Date()

  // Calculate totals
  const totalTarget = items.reduce((acc, item) => acc + item.targetSpend, 0)
  const totalCurrent = items.reduce((acc, item) => acc + item.currentSpend, 0)
  const totalRemaining = Math.max(0, totalTarget - totalCurrent)
  const overallProgress =
    totalTarget > 0
      ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100))
      : 0

  const handleApplyCustomSpend = (itemId: string) => {
    const amount = parseFloat(customSpendAmount)
    if (!isNaN(amount) && amount > 0) {
      onAddSpendIncrement(itemId, amount)
      setCustomSpendAmount("")
      setActiveInputId(null)
    }
  }

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-card/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Target className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                Sign-Up Bonus Pacing (MSR)
              </CardTitle>
              <CardDescription className="text-xs">
                Minimum Spend Requirement tracker & daily velocity analysis
              </CardDescription>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold">
            {items.filter((i) => i.currentSpend < i.targetSpend).length} Active
            Tracker
            {items.filter((i) => i.currentSpend < i.targetSpend).length === 1
              ? ""
              : "s"}
          </Badge>
          {onAddNewMSR && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNewMSR}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Add MSR</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Overall MSR Summary Metric Bar */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-4">
            <div>
              <span className="text-[11px] text-muted-foreground">
                Total Spend Target
              </span>
              <p className="font-heading text-lg font-bold text-foreground">
                ${totalTarget.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Logged Progress
              </span>
              <p className="font-heading text-lg font-bold text-primary">
                ${totalCurrent.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Remaining to Spend
              </span>
              <p className="font-heading text-lg font-bold text-foreground">
                ${totalRemaining.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">
                Overall Completion
              </span>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-foreground">
                  {overallProgress}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalRemaining === 0 ? "🎉 Completed" : "in progress"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center text-muted-foreground">
            <Gift className="size-8 text-muted-foreground/60" />
            <h4 className="mt-2 text-sm font-semibold text-foreground">
              No Active Sign-Up Bonus Trackers
            </h4>
            <p className="mt-1 max-w-sm text-xs">
              When you add a credit card with an active sign-up bonus, your
              spending pacing and deadline will appear here.
            </p>
            {onAddNewMSR && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddNewMSR}
                className="mt-4 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                Track a Welcome Bonus
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const deadline = new Date(item.deadlineDate + "T23:59:59")
              const diffMs = deadline.getTime() - now.getTime()
              const daysRemaining = Math.max(
                0,
                Math.ceil(diffMs / (1000 * 60 * 60 * 24))
              )
              const isExpired = diffMs < 0
              const isCompleted = item.currentSpend >= item.targetSpend
              const remainingSpend = Math.max(
                0,
                item.targetSpend - item.currentSpend
              )
              const percent = Math.min(
                100,
                Math.round((item.currentSpend / item.targetSpend) * 100)
              )

              // Daily pace requirement
              const dailyPaceRequired =
                daysRemaining > 0 && !isCompleted
                  ? Math.round((remainingSpend / daysRemaining) * 100) / 100
                  : 0

              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative space-y-3 rounded-xl border p-4 transition-all",
                    isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/15"
                      : isExpired
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-border/80 bg-card hover:border-primary/40"
                  )}
                >
                  {/* Card Title & Bonus Badge */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {item.cardName}
                        </span>
                        {isCompleted && (
                          <Badge
                            variant="secondary"
                            className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Completed
                          </Badge>
                        )}
                        {isExpired && !isCompleted && (
                          <Badge variant="destructive" className="text-[10px]">
                            Deadline Passed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Sparkles className="size-3.5 shrink-0" />
                        <span>{item.welcomeBonus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>
                            {isCompleted
                              ? "Goal Achieved"
                              : isExpired
                                ? "Expired"
                                : `${daysRemaining} days left`}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Deadline: {item.deadlineDate}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Remove tracker"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar & Amount Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        ${item.currentSpend.toLocaleString()}{" "}
                        <span className="font-normal text-muted-foreground">
                          of ${item.targetSpend.toLocaleString()} target
                        </span>
                      </span>
                      <span className="font-semibold text-primary">
                        {percent}%
                      </span>
                    </div>

                    {/* Visual Progress Track */}
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isCompleted
                            ? "bg-emerald-500"
                            : percent >= 75
                              ? "bg-primary"
                              : percent >= 40
                                ? "bg-amber-500"
                                : "bg-primary/80"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {isCompleted
                          ? "Congratulations! Bonus spend unlocked."
                          : `$${remainingSpend.toLocaleString()} remaining to unlock bonus`}
                      </span>
                      {!isCompleted && !isExpired && (
                        <span className="font-medium text-foreground">
                          Pace: ${dailyPaceRequired.toFixed(2)}/day
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Spend Logging Action Bar */}
                  {!isCompleted && !isExpired && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Quick Add:
                        </span>
                        {[50, 100, 250, 500].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => onAddSpendIncrement(item.id, amt)}
                            className="h-6 px-2 text-[11px] font-medium hover:bg-primary/10 hover:text-primary"
                          >
                            +${amt}
                          </Button>
                        ))}
                      </div>

                      {activeInputId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-24">
                            <span className="absolute top-1.5 left-2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={customSpendAmount}
                              onChange={(e) =>
                                setCustomSpendAmount(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleApplyCustomSpend(item.id)
                              }}
                              className="h-7 pl-5 text-xs"
                              autoFocus
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApplyCustomSpend(item.id)}
                            className="h-7 px-2.5 text-xs"
                          >
                            Add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveInputId(null)
                              setCustomSpendAmount("")
                            }}
                            className="h-7 px-1.5 text-xs text-muted-foreground"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveInputId(item.id)
                              setCustomSpendAmount("")
                            }}
                            className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10"
                          >
                            <Plus className="mr-1 size-3" />
                            Custom Amount
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onUpdateSpend(item.id, item.targetSpend)
                            }
                            className="h-6 px-2 text-[11px] text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                            title="Mark bonus target as fully met"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Mark Met
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
