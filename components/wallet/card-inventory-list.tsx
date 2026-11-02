"use client"

import * as React from "react"
import {
  UserWalletCard,
  MSRTrackerItem,
  CreditRedemptionItem,
} from "@/lib/types/wallet"
import { CreditCard } from "@/types/card"
import { Card } from "@/components/ui/card"
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
  CreditCard as CardIcon,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  Shield,
  ArrowUpDown,
  Search,
} from "lucide-react"

interface CardInventoryListProps {
  cards: UserWalletCard[]
  catalogCards: CreditCard[]
  msrItems: MSRTrackerItem[]
  creditItems: CreditRedemptionItem[]
  onUpdateCard: (id: string, updates: Partial<UserWalletCard>) => void
  onRemoveCard: (id: string) => void
  onOpenAddModal: () => void
  onResetToDemo: () => void
}

type SortField =
  "date-desc" | "date-asc" | "fee-desc" | "fee-asc" | "limit-desc" | "limit-asc"

export function CardInventoryList({
  cards,
  catalogCards,
  msrItems,
  creditItems,
  onUpdateCard,
  onRemoveCard,
  onOpenAddModal,
  onResetToDemo,
}: CardInventoryListProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIssuer, setSelectedIssuer] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<SortField>("date-desc")

  // Edit card state
  const [editingCard, setEditingCard] = React.useState<UserWalletCard | null>(
    null
  )
  const [editNickname, setEditNickname] = React.useState("")
  const [editCreditLimit, setEditCreditLimit] = React.useState<string>("")
  const [editOpenedDate, setEditOpenedDate] = React.useState("")
  const [editNotes, setEditNotes] = React.useState("")

  // Delete confirmation
  const [cardToDelete, setCardToDelete] = React.useState<UserWalletCard | null>(
    null
  )

  const now = new Date()

  // Calculate issuers
  const issuers = React.useMemo(() => {
    const set = new Set<string>()
    cards.forEach((c) => {
      const catalog = catalogCards.find((cat) => cat.id === c.cardSlug)
      if (catalog?.issuer) set.add(catalog.issuer)
    })
    return Array.from(set)
  }, [cards, catalogCards])

  // Open edit modal
  const handleStartEdit = (card: UserWalletCard) => {
    setEditingCard(card)
    setEditNickname(card.nickname || "")
    setEditCreditLimit(card.creditLimit ? String(card.creditLimit) : "")
    setEditOpenedDate(card.openedDate || "")
    setEditNotes(card.notes || "")
  }

  // Save edit
  const handleSaveEdit = () => {
    if (!editingCard) return
    onUpdateCard(editingCard.id, {
      nickname: editNickname.trim() || undefined,
      creditLimit: editCreditLimit ? parseFloat(editCreditLimit) : undefined,
      openedDate: editOpenedDate,
      notes: editNotes.trim() || undefined,
    })
    setEditingCard(null)
  }

  // Filter & sort cards
  const filteredAndSortedCards = React.useMemo(() => {
    return cards
      .filter((card) => {
        const catalog = catalogCards.find((c) => c.id === card.cardSlug)
        const name = catalog?.name || card.cardSlug
        const nick = card.nickname || ""
        const issuer = catalog?.issuer || ""

        if (selectedIssuer !== "all" && issuer !== selectedIssuer) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          return (
            name.toLowerCase().includes(q) ||
            nick.toLowerCase().includes(q) ||
            issuer.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return (
            new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime()
          )
        }
        if (sortBy === "date-asc") {
          return (
            new Date(a.openedDate).getTime() - new Date(b.openedDate).getTime()
          )
        }
        if (sortBy === "fee-desc") {
          return (b.annualFee || 0) - (a.annualFee || 0)
        }
        if (sortBy === "fee-asc") {
          return (a.annualFee || 0) - (b.annualFee || 0)
        }
        if (sortBy === "limit-desc") {
          return (b.creditLimit || 0) - (a.creditLimit || 0)
        }
        if (sortBy === "limit-asc") {
          return (a.creditLimit || 0) - (b.creditLimit || 0)
        }
        return 0
      })
  }, [cards, catalogCards, selectedIssuer, searchQuery, sortBy])

  // Helper for 24-month check
  const isCardUnder24Months = (openedDateStr: string) => {
    const opened = new Date(openedDateStr + "T00:00:00")
    if (isNaN(opened.getTime())) return false
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth() - 24,
      now.getDate()
    )
    return opened >= cutoff
  }

  // Helper for age string
  const formatCardAge = (openedDateStr: string) => {
    const opened = new Date(openedDateStr + "T00:00:00")
    if (isNaN(opened.getTime())) return openedDateStr
    const diffMonths =
      (now.getFullYear() - opened.getFullYear()) * 12 +
      (now.getMonth() - opened.getMonth())

    if (diffMonths <= 0) return "Opened this month"
    if (diffMonths === 1) return "Opened 1 month ago"
    if (diffMonths < 12) return `Opened ${diffMonths} months ago`
    const years = Math.floor(diffMonths / 12)
    const remainingM = diffMonths % 12
    return remainingM > 0
      ? `Opened ${years}y ${remainingM}m ago`
      : `Opened ${years} ${years === 1 ? "year" : "years"} ago`
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
            Card Inventory ({cards.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Your personal portfolio of credit cards, limits, and annual fee
            obligations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              className="size-7"
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
              className="size-7"
              title="List View"
            >
              <ListIcon className="size-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Add Card</span>
          </Button>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border bg-card p-3 shadow-xs">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search wallet cards or nicknames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Issuer filter */}
          {issuers.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-muted-foreground">Issuer:</span>
              <select
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                aria-label="Filter cards by issuer"
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-ring"
              >
                <option value="all">All Issuers</option>
                {issuers.map((iss) => (
                  <option key={iss} value={iss}>
                    {iss}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              aria-label="Sort cards by field"
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-ring"
            >
              <option value="date-desc">Newest Opened</option>
              <option value="date-asc">Oldest Opened</option>
              <option value="fee-desc">Highest Annual Fee</option>
              <option value="fee-asc">Lowest Annual Fee</option>
              <option value="limit-desc">Highest Credit Limit</option>
              <option value="limit-asc">Lowest Credit Limit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {cards.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <CardIcon className="mx-auto size-10 text-muted-foreground/60" />
          <h4 className="mt-3 font-heading text-base font-semibold text-foreground">
            Your Wallet is Empty
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Add cards to track annual fees, Chase 5/24 slot pacing (max 5 cards in 24 months), and statement
            credits.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={onOpenAddModal}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add Your First Card
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToDemo}
              className="h-8 text-xs"
            >
              Load Demo Cards
            </Button>
          </div>
        </Card>
      ) : filteredAndSortedCards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
          No cards match your search or filter criteria.
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCards.map((card) => {
            const catalog = catalogCards.find((c) => c.id === card.cardSlug)
            const is524 = isCardUnder24Months(card.openedDate)
            const activeMSR = msrItems.find((m) => m.userCardId === card.id)
            const cardCredits = creditItems.filter(
              (cr) => cr.userCardId === card.id
            )

            return (
              <Card
                key={card.id}
                className="group relative flex flex-col justify-between overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-card/60 transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Header card design badge */}
                <div className="space-y-3 p-4">
                  {/* Issuer & Status row */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold"
                    >
                      {catalog?.issuer || "Card"}
                    </Badge>

                    {is524 ? (
                      <Badge
                        variant="secondary"
                        className="border-primary/20 bg-primary/10 text-[10px] font-medium text-primary"
                      >
                        <Shield className="mr-1 size-3" />
                        Counts toward 5/24
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-muted-foreground"
                      >
                        Aged Out (&gt;24 mos)
                      </Badge>
                    )}
                  </div>

                  {/* Card Name & Nickname */}
                  <div>
                    <h4 className="font-heading text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                      {catalog?.name || card.cardSlug}
                    </h4>
                    {card.nickname && (
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground italic">
                        &ldquo;{card.nickname}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Date opened & age */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{card.openedDate}</span>
                    <span>•</span>
                    <span className="text-[11px]">
                      {formatCardAge(card.openedDate)}
                    </span>
                  </div>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Annual Fee
                      </span>
                      <p className="font-heading font-bold text-foreground">
                        {card.annualFee > 0
                          ? `$${card.annualFee}/yr`
                          : "$0 (No AF)"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Credit Limit
                      </span>
                      <p className="font-heading font-bold text-foreground">
                        {card.creditLimit
                          ? `$${card.creditLimit.toLocaleString()}`
                          : "N/A (Charge)"}
                      </p>
                    </div>
                  </div>

                  {/* Active MSR mini tracker if present */}
                  {activeMSR && (
                    <div className="space-y-1 rounded-lg border border-primary/25 bg-primary/5 p-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Sparkles className="size-3" />
                          MSR Progress
                        </span>
                        <span className="font-semibold text-foreground">
                          ${activeMSR.currentSpend.toLocaleString()} / $
                          {activeMSR.targetSpend.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (activeMSR.currentSpend /
                                  activeMSR.targetSpend) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Statement credits count */}
                  {cardCredits.length > 0 && (
                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Perks & Credits:</span>
                      <span className="font-medium text-foreground">
                        {cardCredits.filter((c) => c.isRedeemed).length}/
                        {cardCredits.length} claimed ( $
                        {cardCredits.reduce((sum, c) => sum + c.amount, 0)}/yr)
                      </span>
                    </div>
                  )}

                  {card.notes && (
                    <p className="line-clamp-2 border-t pt-2 text-[11px] text-muted-foreground">
                      {card.notes}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-2 text-xs">
                  <span className="text-[10px] text-muted-foreground">
                    {catalog?.network || "Credit"}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleStartEdit(card)}
                      className="size-7 text-muted-foreground hover:text-foreground"
                      title="Edit card details"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setCardToDelete(card)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                      title="Delete card"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Card Name</th>
                  <th className="px-3 py-3">Issuer</th>
                  <th className="px-3 py-3">Opened</th>
                  <th className="px-3 py-3">5/24 (24-Mo Window)</th>
                  <th className="px-3 py-3 text-right">Annual Fee</th>
                  <th className="px-3 py-3 text-right">Credit Limit</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAndSortedCards.map((card) => {
                  const catalog = catalogCards.find(
                    (c) => c.id === card.cardSlug
                  )
                  const is524 = isCardUnder24Months(card.openedDate)

                  return (
                    <tr
                      key={card.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {catalog?.name || card.cardSlug}
                        </div>
                        {card.nickname && (
                          <div className="text-[11px] text-muted-foreground italic">
                            &ldquo;{card.nickname}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {catalog?.issuer || "-"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-foreground">{card.openedDate}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatCardAge(card.openedDate)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {is524 ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-[10px] font-medium text-primary"
                          >
                            Counts (&lt;24 mos)
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            Aged Out (&gt;24 mos)
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-foreground">
                        ${card.annualFee}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-foreground">
                        {card.creditLimit
                          ? `$${card.creditLimit.toLocaleString()}`
                          : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleStartEdit(card)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setCardToDelete(card)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Card Dialog */}
      <Dialog
        open={Boolean(editingCard)}
        onOpenChange={(open) => !open && setEditingCard(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Card Details</DialogTitle>
            <DialogDescription className="text-xs">
              Update nickname, credit limit, opened date, or notes for this
              card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Card
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {catalogCards.find((c) => c.id === editingCard?.cardSlug)
                  ?.name || editingCard?.cardSlug}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">
                Nickname
              </label>
              <Input
                placeholder="e.g. Dining Card, Travel Hub"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">
                  Opened Date
                </label>
                <Input
                  type="date"
                  value={editOpenedDate}
                  onChange={(e) => setEditOpenedDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">
                  Credit Limit ($)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 15000"
                  value={editCreditLimit}
                  onChange={(e) => setEditCreditLimit(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">
                Notes
              </label>
              <Input
                placeholder="Personal notes or spending strategy..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCard(null)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Card Confirmation Dialog */}
      <Dialog
        open={Boolean(cardToDelete)}
        onOpenChange={(open) => !open && setCardToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Card from Wallet?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove{" "}
              <strong>
                {catalogCards.find((c) => c.id === cardToDelete?.cardSlug)
                  ?.name || cardToDelete?.cardSlug}
              </strong>
              ? This will also remove any associated MSR trackers and statement
              credits.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCardToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (cardToDelete) {
                  onRemoveCard(cardToDelete.id)
                  setCardToDelete(null)
                }
              }}
            >
              Remove Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
