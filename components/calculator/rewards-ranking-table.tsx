"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import {
  MonthlySpend,
  ValuationMode,
  CreditUtilityState,
  calculateCardRewards,
  SpendCategory,
  SPEND_CATEGORIES,
} from "@/lib/calculator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, Search, Check, Plus, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface RewardsRankingTableProps {
  cards: CreditCard[]
  spend: MonthlySpend
  valuationMode: ValuationMode
  creditOverrides: CreditUtilityState
  selectedCardId: string
  onSelectCard: (card: CreditCard) => void
  comparedCardIds: string[]
  onToggleCompareCard: (cardId: string) => void
  className?: string
}

type SortColumn = "netValue" | "grossValue" | "points" | "fee"

export function RewardsRankingTable({
  cards,
  spend,
  valuationMode,
  creditOverrides,
  selectedCardId,
  onSelectCard,
  comparedCardIds,
  onToggleCompareCard,
  className,
}: RewardsRankingTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTier, setSelectedTier] = React.useState<string>("all")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<SortColumn>("netValue")
  const [sortAsc, setSortAsc] = React.useState<boolean>(false)

  // Compute breakdowns for all cards
  const allBreakdowns = React.useMemo(() => {
    return cards.map((card) =>
      calculateCardRewards(card, spend, valuationMode, creditOverrides)
    )
  }, [cards, spend, valuationMode, creditOverrides])

  // Get unique tiers from cards
  const availableTiers = React.useMemo(() => {
    const tiers = new Set<string>()
    cards.forEach((c) => {
      if (c.tier) tiers.add(c.tier)
    })
    return Array.from(tiers).sort()
  }, [cards])

  // Filter cards
  const filteredBreakdowns = React.useMemo(() => {
    return allBreakdowns.filter((item) => {
      const { card, topCategory } = item

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const match =
          card.name.toLowerCase().includes(query) ||
          card.issuer.toLowerCase().includes(query) ||
          card.rewardProgram.name.toLowerCase().includes(query) ||
          topCategory.label.toLowerCase().includes(query)
        if (!match) return false
      }

      // Tier filter
      if (selectedTier !== "all" && card.tier !== selectedTier) {
        return false
      }

      // Category filter (cards with >= 3x on selected category)
      if (selectedCategory !== "all") {
        const catKey = selectedCategory as SpendCategory
        const multiplier = card.rates?.[catKey] ?? 0
        if (multiplier < 2) return false
      }

      return true
    })
  }, [allBreakdowns, searchQuery, selectedTier, selectedCategory])

  // Sort cards
  const sortedBreakdowns = React.useMemo(() => {
    return [...filteredBreakdowns].sort((a, b) => {
      let diff = 0
      switch (sortBy) {
        case "grossValue":
          diff = a.grossDollarValue - b.grossDollarValue
          break
        case "points":
          diff = a.annualPoints - b.annualPoints
          break
        case "fee":
          diff = a.annualFee - b.annualFee
          break
        case "netValue":
        default:
          diff = a.netAnnualValue - b.netAnnualValue
          break
      }
      return sortAsc ? diff : -diff
    })
  }, [filteredBreakdowns, sortBy, sortAsc])

  const handleSortToggle = (col: SortColumn) => {
    if (sortBy === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(col)
      setSortAsc(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Filter Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search card name or issuer..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tier Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              Tier:
            </span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            >
              <option value="all">All Tiers ({cards.length})</option>
              {availableTiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Category Booster Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              Bonus On:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            >
              <option value="all">All Categories</option>
              {SPEND_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortLabel} (≥2x)
                </option>
              ))}
            </select>
          </div>

          {(selectedTier !== "all" ||
            selectedCategory !== "all" ||
            searchQuery) && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setSelectedTier("all")
                setSelectedCategory("all")
                setSearchQuery("")
              }}
              className="h-7 text-xs text-muted-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <strong className="text-foreground">{sortedBreakdowns.length}</strong>{" "}
          cards ranked by Net Annual Return
        </span>
        <span>Click any row to inspect in Net Fee Analyzer</span>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12 text-center font-bold">#</TableHead>
              <TableHead className="min-w-[200px]">Card & Issuer</TableHead>
              <TableHead className="min-w-[140px]">Top Multiplier</TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSortToggle("points")}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-primary"
                >
                  Point Yield
                  <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSortToggle("grossValue")}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-primary"
                >
                  Gross Value
                  <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSortToggle("fee")}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold hover:text-primary"
                >
                  Annual Fee
                  <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  onClick={() => handleSortToggle("netValue")}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary hover:underline"
                >
                  Net Annual Value
                  <ArrowUpDown className="size-3" />
                </button>
              </TableHead>
              <TableHead className="w-24 text-center">Compare</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBreakdowns.length > 0 ? (
              sortedBreakdowns.map((item, index) => {
                const {
                  card,
                  annualPoints,
                  grossDollarValue,
                  annualFee,
                  netAnnualValue,
                  topCategory,
                  cppValuation,
                } = item

                const isSelected = card.id === selectedCardId
                const isCompared = comparedCardIds.includes(card.id)
                const isPositive = netAnnualValue > 0

                return (
                  <TableRow
                    key={card.id}
                    onClick={() => onSelectCard(card)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/8 font-medium hover:bg-primary/12"
                        : "hover:bg-muted/40"
                    )}
                  >
                    {/* Rank */}
                    <TableCell className="text-center font-mono text-xs font-bold text-muted-foreground">
                      {index === 0 ? (
                        <div className="flex items-center justify-center">
                          <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <Trophy className="size-3" />
                          </span>
                        </div>
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>

                    {/* Card & Issuer */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs font-bold text-foreground">
                            {card.name}
                          </span>
                          {card.recommended && (
                            <Badge
                              variant="default"
                              className="h-4 px-1 text-[9px] font-normal"
                            >
                              Top Pick
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{card.issuer}</span>
                          <span>•</span>
                          <span>{card.rewardProgram.name}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Top Multiplier */}
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs font-semibold"
                      >
                        {topCategory.label} ({topCategory.rate}x)
                      </Badge>
                    </TableCell>

                    {/* Point Yield */}
                    <TableCell className="text-right">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {annualPoints.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        ~{Math.round(annualPoints / 12).toLocaleString()}/mo
                      </div>
                    </TableCell>

                    {/* Gross Value */}
                    <TableCell className="text-right">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        ${grossDollarValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{cppValuation} cpp
                      </div>
                    </TableCell>

                    {/* Annual Fee */}
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {annualFee === 0 ? "$0" : `$${annualFee}`}
                    </TableCell>

                    {/* Net Annual Value */}
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "font-mono text-sm font-bold",
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        )}
                      >
                        {isPositive ? "+" : ""}${netAnnualValue.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        net return / yr
                      </div>
                    </TableCell>

                    {/* Compare Checkbox / Toggle */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleCompareCard(card.id)
                      }}
                    >
                      <Button
                        variant={isCompared ? "default" : "outline"}
                        size="xs"
                        className="h-6 w-16 text-[10px]"
                      >
                        {isCompared ? (
                          <>
                            <Check className="mr-1 size-2.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 size-2.5" />
                            Compare
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No cards matched the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
