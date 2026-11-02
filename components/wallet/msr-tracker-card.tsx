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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Gift,
  Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MSRTrackerCardProps {
  items: MSRTrackerItem[]
  onUpdateSpend: (id: string, newSpend: number) => void
  onAddSpendIncrement: (id: string, increment: number) => void
  onUpdateItem?: (id: string, updates: Partial<MSRTrackerItem>) => void
  onRemoveItem: (id: string) => void
  onAddNewMSR?: () => void
}

export function MSRTrackerCard({
  items,
  onUpdateSpend,
  onAddSpendIncrement,
  onUpdateItem,
  onRemoveItem,
  onAddNewMSR,
}: MSRTrackerCardProps) {
  // Track open spend increment popovers / inputs by item id
  const [activeInputId, setActiveInputId] = React.useState<string | null>(null)
  const [customSpendAmount, setCustomSpendAmount] = React.useState<string>("")

  // Edit tracker dialog state
  const [editingItem, setEditingItem] = React.useState<MSRTrackerItem | null>(
    null
  )
  const [editCardName, setEditCardName] = React.useState("")
  const [editTargetSpend, setEditTargetSpend] = React.useState("")
  const [editCurrentSpend, setEditCurrentSpend] = React.useState("")
  const [editDeadlineDate, setEditDeadlineDate] = React.useState("")
  const [editWelcomeBonus, setEditWelcomeBonus] = React.useState("")

  const now = new Date()

  // Calculate totals
  const totalTarget = items.reduce((acc, item) => acc + item.targetSpend, 0)
  const totalCurrent = items.reduce((acc, item) => acc + item.currentSpend, 0)
  const totalRemaining = Math.max(0, totalTarget - totalCurrent)
  const overallProgress =
    totalTarget > 0
      ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100))
      : 0

  const handleAddIncrement = (itemId: string, amount: number) => {
    onAddSpendIncrement(itemId, amount)
  }

  const handleApplyCustomSpend = (itemId: string) => {
    const amount = parseFloat(customSpendAmount)
    if (!isNaN(amount) && amount > 0) {
      handleAddIncrement(itemId, amount)
      setCustomSpendAmount("")
      setActiveInputId(null)
    }
  }

  const handleMarkMet = (item: MSRTrackerItem) => {
    const diff = Math.max(0, item.targetSpend - item.currentSpend)
    if (diff > 0) {
      handleAddIncrement(item.id, diff)
    }
  }

  const handleStartEdit = (item: MSRTrackerItem) => {
    setEditingItem(item)
    setEditCardName(item.cardName)
    setEditTargetSpend(String(item.targetSpend))
    setEditCurrentSpend(String(item.currentSpend))
    setEditDeadlineDate(item.deadlineDate)
    setEditWelcomeBonus(item.welcomeBonus)
  }

  const handleSaveEdit = () => {
    if (!editingItem) return
    const target = parseFloat(editTargetSpend)
    const current = parseFloat(editCurrentSpend)

    if (isNaN(target) || target <= 0) return

    const sanitizedCurrent = isNaN(current) ? 0 : Math.max(0, current)
    const sanitizedTarget = Math.max(0, target)

    if (onUpdateItem) {
      onUpdateItem(editingItem.id, {
        cardName: editCardName.trim() || editingItem.cardName,
        targetSpend: sanitizedTarget,
        currentSpend: sanitizedCurrent,
        deadlineDate: editDeadlineDate || editingItem.deadlineDate,
        welcomeBonus: editWelcomeBonus.trim() || editingItem.welcomeBonus,
      })
    } else {
      onUpdateSpend(editingItem.id, sanitizedCurrent)
    }

    setEditingItem(null)
  }

  // Preview calculations for the edit dialog
  const previewTarget = parseFloat(editTargetSpend) || 0
  const previewCurrent = parseFloat(editCurrentSpend) || 0
  const previewRemaining = Math.max(0, previewTarget - previewCurrent)
  const previewPercent =
    previewTarget > 0
      ? Math.min(100, Math.round((previewCurrent / previewTarget) * 100))
      : 0
  const previewDeadline = editDeadlineDate
    ? new Date(editDeadlineDate + "T23:59:59")
    : null
  const previewDaysRemaining =
    previewDeadline && !isNaN(previewDeadline.getTime())
      ? Math.max(
          0,
          Math.ceil((previewDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        )
      : 0
  const previewDailyPace =
    previewDaysRemaining > 0 && previewRemaining > 0
      ? (previewRemaining / previewDaysRemaining).toFixed(2)
      : "0.00"

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
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="group flex items-center gap-1.5 text-left font-heading text-sm font-bold text-foreground transition-colors hover:text-primary"
                          title="Click to edit tracker details"
                        >
                          <span>{item.cardName}</span>
                          <Pencil className="size-3 text-primary opacity-0 transition-opacity group-hover:opacity-80" />
                        </button>
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
                        onClick={() => handleStartEdit(item)}
                        className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit tracker details"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit tracker</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remove tracker"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Remove tracker</span>
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
                  {!isCompleted && !isExpired ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Quick Add:
                        </span>
                        {[50, 100, 250, 500].map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddIncrement(item.id, amt)}
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
                            onClick={() => handleMarkMet(item)}
                            className="h-6 px-2 text-[11px] text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                            title="Mark bonus target as fully met"
                          >
                            <CheckCircle2 className="mr-1 size-3" />
                            Mark Met
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(item)}
                            className="h-6 px-2 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit tracker details"
                          >
                            <Pencil className="mr-1 size-3" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-[11px] font-medium",
                            isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-500"
                          )}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="size-3" />
                              Target spend unlocked
                            </>
                          ) : (
                            "Tracking deadline passed"
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="h-6 px-2 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="mr-1 size-3" />
                        Edit Tracker
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Edit MSR Tracker Modal */}
      <Dialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Pencil className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Edit Sign-Up Bonus Tracker
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Adjust target spend, current progress, deadline, and bonus
                  details.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Card Name */}
            <div>
              <label className="text-xs font-semibold text-foreground">
                Card Name / Tracker Title
              </label>
              <Input
                value={editCardName}
                onChange={(e) => setEditCardName(e.target.value)}
                placeholder="e.g. Chase Sapphire Preferred® Card"
                className="mt-1 text-xs"
              />
            </div>

            {/* Target & Current Spend in a 2-col grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Target Spend ($)</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    Requirement
                  </span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute top-2 left-2.5 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={editTargetSpend}
                    onChange={(e) => setEditTargetSpend(e.target.value)}
                    className="pl-6 text-xs"
                    placeholder="e.g. 4000"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span>Current Spend ($)</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    Logged
                  </span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute top-2 left-2.5 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={editCurrentSpend}
                    onChange={(e) => setEditCurrentSpend(e.target.value)}
                    className="pl-6 text-xs"
                    placeholder="e.g. 2500"
                  />
                </div>
              </div>
            </div>

            {/* Quick spend adjustment presets inside modal */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
              <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                Quick Adjust:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const cur = parseFloat(editCurrentSpend) || 0
                  setEditCurrentSpend(String(Math.max(0, cur - 100)))
                }}
                className="h-6 px-2 text-[10px]"
              >
                -$100
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const cur = parseFloat(editCurrentSpend) || 0
                  setEditCurrentSpend(String(cur + 100))
                }}
                className="h-6 px-2 text-[10px]"
              >
                +$100
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const cur = parseFloat(editCurrentSpend) || 0
                  setEditCurrentSpend(String(cur + 250))
                }}
                className="h-6 px-2 text-[10px]"
              >
                +$250
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const tgt = parseFloat(editTargetSpend) || 0
                  setEditCurrentSpend(String(tgt))
                }}
                className="h-6 px-2 text-[10px] text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                Match Target
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditCurrentSpend("0")}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to $0
              </Button>
            </div>

            {/* Deadline Date & Welcome Bonus */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Deadline Date
                </label>
                <Input
                  type="date"
                  value={editDeadlineDate}
                  onChange={(e) => setEditDeadlineDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Welcome Bonus Description
                </label>
                <Input
                  value={editWelcomeBonus}
                  onChange={(e) => setEditWelcomeBonus(e.target.value)}
                  placeholder="e.g. 75,000 points"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {/* Live Pacing & Progress Preview */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>
                  Preview: ${previewCurrent.toLocaleString()} of $
                  {previewTarget.toLocaleString()}
                </span>
                <span className="text-primary">{previewPercent}% Complete</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${previewPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {previewRemaining === 0
                    ? "🎉 Spend goal achieved!"
                    : `$${previewRemaining.toLocaleString()} remaining to unlock`}
                </span>
                <span>
                  {previewDaysRemaining > 0
                    ? `${previewDaysRemaining} days left ($${previewDailyPace}/day pace)`
                    : "Deadline passed"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="font-semibold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
