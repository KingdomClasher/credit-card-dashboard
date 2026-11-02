"use client"

import * as React from "react"
import { CreditCard, FilterState, QuickCategory } from "@/types/card"
import { INITIAL_FILTERS, filterAndSortCards } from "@/lib/card-filter"
import { Navbar } from "@/components/layout/navbar"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { SearchSortHeader } from "@/components/catalog/search-sort-header"
import { CardGrid } from "@/components/catalog/card-grid"
import { CardDetailSheet } from "@/components/catalog/card-detail-sheet"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Shield,
  Compass,
  Zap,
  CreditCard as CreditCardIcon,
  Plane,
  Utensils,
  ShoppingCart,
  BadgePercent,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CatalogViewProps {
  cards: CreditCard[]
}

const QUICK_CATEGORIES: {
  id: QuickCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "all", label: "All", icon: CreditCardIcon },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "dining", label: "Dining", icon: Utensils },
  { id: "groceries", label: "Groceries", icon: ShoppingCart },
  { id: "zero_fee", label: "$0 Fee", icon: BadgePercent },
  { id: "cash_back", label: "Cash Back", icon: Banknote },
]

export function CatalogView({ cards }: CatalogViewProps) {
  const [filters, setFilters] = React.useState<FilterState>(INITIAL_FILTERS)
  const [selectedCard, setSelectedCard] = React.useState<CreditCard | null>(
    null
  )
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Filter and sort cards in real-time
  const filteredCards = React.useMemo(() => {
    return filterAndSortCards(cards, filters)
  }, [cards, filters])

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  const handleSelectCard = (card: CreditCard) => {
    setSelectedCard(card)
    setSheetOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative border-b bg-muted/20 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-primary/20 bg-background px-2.5 py-1 text-xs font-semibold text-primary"
              >
                <Compass className="size-3.5" />
                Discovery Engine
              </Badge>
              <Badge variant="secondary" className="text-xs">
                35 Premier Cards
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Updated October 2026
              </Badge>
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Card Catalog & Discovery Grid
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore the complete spectrum of credit cards across top issuers.
              Filter by annual fee, welcome bonus value, high-yield category
              multipliers, and travel perks to find your ideal card pairing.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-500" />
                Up to $2,800 Welcome Offers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Faceted Multiplier Radars
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Chase 5/24 & Bank Rule Warnings
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Discovery Layout */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          {/* Desktop Filter Sidebar */}
          <div className="sticky top-24 hidden w-72 shrink-0 lg:block">
            <div className="rounded-2xl border bg-card p-5 shadow-xs">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onResetFilters={handleResetFilters}
                cards={cards}
              />
            </div>
          </div>

          {/* Main Grid & Search Area */}
          <main className="w-full min-w-0 flex-1">
            {/* Search, Sort, and Counter Bar */}
            <SearchSortHeader
              filters={filters}
              onFiltersChange={setFilters}
              onResetFilters={handleResetFilters}
              totalCount={cards.length}
              filteredCount={filteredCards.length}
              allCards={cards}
            />

            {/* Mobile Quick Category Filter Strip */}
            <div className="mb-4 lg:hidden">
              <div className="flex items-center gap-2 overflow-x-auto p-1 no-scrollbar scroll-smooth">
                {QUICK_CATEGORIES.map((cat) => {
                  const isActive = (filters.quickCategory || "all") === cat.id
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          quickCategory:
                            isActive && cat.id !== "all" ? "all" : cat.id,
                        })
                      }
                      className={cn(
                        "inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all select-none active:scale-95",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Responsive Card Grid */}
            <CardGrid
              cards={filteredCards}
              onSelectCard={handleSelectCard}
              onResetFilters={handleResetFilters}
            />
          </main>
        </div>
      </div>

      {/* Slide-out Card Detail Sheet */}
      <CardDetailSheet
        card={selectedCard}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
