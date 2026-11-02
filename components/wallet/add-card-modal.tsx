"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  CreditCard as CardIcon,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react"

interface AddCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogCards: CreditCard[]
  onAddCard: (cardData: {
    cardSlug: string
    nickname?: string
    openedDate: string
    bonusEarnedDate?: string
    creditLimit?: number
    annualFee?: number
    notes?: string
    targetSpend?: number
    currentSpend?: number
    deadlineDate?: string
    welcomeBonus?: string
    trackMSR?: boolean
  }) => void
}

export function AddCardModal({
  open,
  onOpenChange,
  catalogCards,
  onAddCard,
}: AddCardModalProps) {
  // Today's date as default YYYY-MM-DD
  const todayStr = React.useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }, [])

  // Form states
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCard, setSelectedCard] = React.useState<CreditCard | null>(
    null
  )
  const [nickname, setNickname] = React.useState("")
  const [openedDate, setOpenedDate] = React.useState(todayStr)
  const [bonusEarnedDate, setBonusEarnedDate] = React.useState("")
  const [creditLimit, setCreditLimit] = React.useState("")
  const [trackMSR, setTrackMSR] = React.useState(true)
  const [startingSpend, setStartingSpend] = React.useState("")
  const [targetSpend, setTargetSpend] = React.useState("")
  const [deadlineDate, setDeadlineDate] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Reset form helper
  const resetForm = React.useCallback(() => {
    setSearchQuery("")
    setSelectedCard(null)
    setNickname("")
    setOpenedDate(todayStr)
    setBonusEarnedDate("")
    setCreditLimit("")
    setTrackMSR(true)
    setStartingSpend("")
    setTargetSpend("")
    setDeadlineDate("")
    setNotes("")
    setErrorMsg(null)
  }, [todayStr])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  // Filtered cards for search picker
  const filteredCards = React.useMemo(() => {
    if (!searchQuery.trim()) return catalogCards.slice(0, 10)
    const q = searchQuery.toLowerCase()
    return catalogCards
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.issuer.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tier.toLowerCase().includes(q)
      )
      .slice(0, 15)
  }, [catalogCards, searchQuery])

  // When a card is selected from picker
  const handleSelectCard = (card: CreditCard) => {
    setSelectedCard(card)
    setErrorMsg(null)

    // Set default target spend and deadline if card has signup bonus
    if (card.signupBonus && card.signupBonus.spendRequirement > 0) {
      setTargetSpend(String(card.signupBonus.spendRequirement))
      setTrackMSR(true)

      // Calculate default deadline: openedDate + timeframeMonths
      const opened = new Date((openedDate || todayStr) + "T00:00:00")
      const months = card.signupBonus.timeframeMonths || 3
      const deadline = new Date(
        opened.getFullYear(),
        opened.getMonth() + months,
        opened.getDate()
      )
      const dy = deadline.getFullYear()
      const dm = String(deadline.getMonth() + 1).padStart(2, "0")
      const dd = String(deadline.getDate()).padStart(2, "0")
      setDeadlineDate(`${dy}-${dm}-${dd}`)
    } else {
      setTrackMSR(false)
      setTargetSpend("")
      setDeadlineDate("")
    }
  }

  // Recalculate deadline if openedDate changes while a card is selected
  const handleOpenedDateChange = (newDateStr: string) => {
    setOpenedDate(newDateStr)
    if (
      selectedCard?.signupBonus &&
      selectedCard.signupBonus.spendRequirement > 0
    ) {
      const opened = new Date(newDateStr + "T00:00:00")
      if (!isNaN(opened.getTime())) {
        const months = selectedCard.signupBonus.timeframeMonths || 3
        const deadline = new Date(
          opened.getFullYear(),
          opened.getMonth() + months,
          opened.getDate()
        )
        const dy = deadline.getFullYear()
        const dm = String(deadline.getMonth() + 1).padStart(2, "0")
        const dd = String(deadline.getDate()).padStart(2, "0")
        setDeadlineDate(`${dy}-${dm}-${dd}`)
      }
    }
  }

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCard) {
      setErrorMsg("Please select a credit card from the list.")
      return
    }

    if (!openedDate) {
      setErrorMsg("Please provide the date when this card was opened.")
      return
    }

    const limitNum = creditLimit.trim() ? parseFloat(creditLimit) : undefined
    const startSpendNum = startingSpend.trim() ? parseFloat(startingSpend) : 0
    const targetSpendNum = targetSpend.trim()
      ? parseFloat(targetSpend)
      : selectedCard.signupBonus?.spendRequirement || 0

    onAddCard({
      cardSlug: selectedCard.id,
      nickname: nickname.trim() || undefined,
      openedDate,
      bonusEarnedDate: bonusEarnedDate || undefined,
      creditLimit: limitNum,
      annualFee: selectedCard.annualFee,
      notes: notes.trim() || undefined,
      trackMSR: trackMSR && targetSpendNum > 0,
      targetSpend: targetSpendNum,
      currentSpend: startSpendNum,
      deadlineDate: deadlineDate || undefined,
      welcomeBonus: selectedCard.signupBonus
        ? `${selectedCard.signupBonus.amount} ${selectedCard.signupBonus.unit}`
        : undefined,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-6">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CardIcon className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Add Card to My Wallet
              </DialogTitle>
              <DialogDescription className="text-xs">
                Track your credit limit, Chase 5/24 aging, sign-up bonus, and
                perks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Card Picker Section */}
          {!selectedCard ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                1. Select Card from Catalog{" "}
                <span className="text-destructive">*</span>
              </label>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search 35 credit cards (e.g. Sapphire, Gold, Venture X, BoA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs"
                  autoFocus
                />
              </div>

              {/* Card suggestions list */}
              <div className="max-h-56 divide-y overflow-y-auto rounded-lg border bg-card text-xs">
                {filteredCards.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No matching credit cards found for &ldquo;{searchQuery}
                    &rdquo;.
                  </div>
                ) : (
                  filteredCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className="flex cursor-pointer items-center justify-between p-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {card.name}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {card.issuer}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {card.signupBonus?.amount
                            ? `Bonus: ${card.signupBonus.amount} ${card.signupBonus.unit}`
                            : "No active signup bonus"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-foreground">
                          ${card.annualFee}/yr
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Selected Card Preview Banner */
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[10px]">
                    {selectedCard.issuer}
                  </Badge>
                  <span className="font-heading text-xs font-bold text-foreground">
                    {selectedCard.name}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Annual Fee: ${selectedCard.annualFee}/yr • Network:{" "}
                  {selectedCard.network}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCard(null)}
                className="h-7 text-xs"
              >
                Change Card
              </Button>
            </div>
          )}

          {/* Form Fields: Date Opened, Bonus Earned Date, & Credit Limit */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Date Opened <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                required
                value={openedDate}
                onChange={(e) => handleOpenedDateChange(e.target.value)}
                className="mt-1 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">
                Calculates 5/24 status & drop-offs
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Bonus Earned (Optional)
              </label>
              <Input
                type="date"
                value={bonusEarnedDate}
                onChange={(e) => setBonusEarnedDate(e.target.value)}
                className="mt-1 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">
                For 48-mo (Chase) & 15-mo (WF) timers
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Credit Limit (Optional)
              </label>
              <div className="relative mt-1">
                <span className="absolute top-2 left-2.5 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 15000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="pl-6 text-xs"
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                Leave blank for charge cards
              </span>
            </div>
          </div>

          {/* Nickname & Strategy Notes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Custom Nickname (Optional)
              </label>
              <Input
                placeholder="e.g. Everyday Dining, Work Travel"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Notes (Optional)
              </label>
              <Input
                placeholder="e.g. Retention offer notes, downgrade plan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          {/* MSR Sign-up Bonus Section */}
          {selectedCard && selectedCard.signupBonus?.spendRequirement > 0 && (
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={trackMSR}
                    onChange={(e) => setTrackMSR(e.target.checked)}
                    className="size-3.5 rounded border-muted-foreground"
                  />
                  <span>Track Sign-Up Bonus Minimum Spend (MSR)</span>
                </label>
                <Badge variant="outline" className="text-[10px] text-primary">
                  <Sparkles className="mr-1 size-3" />
                  {selectedCard.signupBonus.amount}{" "}
                  {selectedCard.signupBonus.unit}
                </Badge>
              </div>

              {trackMSR && (
                <div className="grid grid-cols-1 gap-3 border-t border-border/40 pt-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-medium text-foreground">
                      Target Spend ($)
                    </label>
                    <Input
                      type="number"
                      value={targetSpend}
                      onChange={(e) => setTargetSpend(e.target.value)}
                      className="mt-1 h-7 text-xs"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground">
                      Starting Spend ($)
                    </label>
                    <Input
                      type="number"
                      value={startingSpend}
                      onChange={(e) => setStartingSpend(e.target.value)}
                      className="mt-1 h-7 text-xs"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground">
                      Deadline Date
                    </label>
                    <Input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strict Zero-PAN Assurance Banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
            <Lock className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-0.5 text-muted-foreground">
              <span className="font-semibold text-foreground">
                Strict Zero-PAN Security Guarantee
              </span>
              <p className="text-[11px]">
                We never ask for, collect, or store your 16-digit card number,
                CVV, expiration date, or banking credentials. All tracking is
                based solely on card product names, dates, and spend estimates
                stored locally in your browser.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!selectedCard}>
              Add to Wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
