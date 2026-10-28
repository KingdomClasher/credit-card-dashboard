"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { FilterState, SortOption, CreditCard } from "@/types/card"
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react"

interface SearchSortHeaderProps {
  filters: FilterState
  onFiltersChange: (newFilters: FilterState) => void
  onResetFilters: () => void
  totalCount: number
  filteredCount: number
  allCards: CreditCard[]
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Editorial Rating (High to Low)", value: "rating" },
  { label: "Annual Fee (Low to High)", value: "fee-asc" },
  { label: "Annual Fee (High to Low)", value: "fee-desc" },
  { label: "Welcome Bonus Value (High to Low)", value: "bonus-desc" },
]

export function SearchSortHeader({
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
  filteredCount,
  allCards,
}: SearchSortHeaderProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: e.target.value })
  }

  const handleClearSearch = () => {
    onFiltersChange({ ...filters, searchQuery: "" })
  }

  const handleSortChange = (value: string | null) => {
    if (value) {
      onFiltersChange({ ...filters, sortBy: value as SortOption })
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search Input Bar */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by card name, issuer, or rewards..."
            className="h-10 w-full rounded-xl border-border/80 bg-card pr-9 pl-9 text-sm focus-visible:ring-2"
          />
          {filters.searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClearSearch}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Sort & Mobile Filters Control */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile Filter Sheet Trigger */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 gap-1.5 rounded-xl border-border px-3 text-xs font-medium lg:hidden"
                />
              }
            >
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>Filters</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full overflow-y-auto p-6 sm:max-w-md"
            >
              <SheetHeader className="pb-2">
                <SheetTitle className="font-heading text-lg font-bold">
                  Card Filters
                </SheetTitle>
              </SheetHeader>
              <FilterSidebar
                filters={filters}
                onFiltersChange={onFiltersChange}
                onResetFilters={() => {
                  onResetFilters()
                  setMobileFilterOpen(false)
                }}
                cards={allCards}
                className="mt-2"
              />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="h-10 min-w-[210px] rounded-xl border-border/80 bg-card px-3 text-xs font-medium">
                <div className="mr-1 flex items-center gap-1.5 text-muted-foreground">
                  <ArrowUpDown className="size-3.5 text-primary" />
                  <span className="text-foreground">Sort:</span>
                </div>
                <SelectValue placeholder="Sort cards..." />
              </SelectTrigger>
              <SelectContent align="end" className="w-[240px]">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Card Count Counter Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Showing{" "}
            <strong className="font-semibold text-foreground">
              {filteredCount}
            </strong>{" "}
            of{" "}
            <strong className="font-semibold text-foreground">
              {totalCount}
            </strong>{" "}
            cards
          </span>
          {filters.searchQuery && (
            <Badge
              variant="secondary"
              className="h-4.5 px-1.5 text-[10px] font-normal"
            >
              matching &ldquo;{filters.searchQuery}&rdquo;
            </Badge>
          )}
        </div>
        {filteredCount !== totalCount && (
          <Button
            variant="link"
            onClick={onResetFilters}
            className="h-auto p-0 text-xs text-primary underline-offset-4 hover:underline"
          >
            Show all
          </Button>
        )}
      </div>
    </div>
  )
}
