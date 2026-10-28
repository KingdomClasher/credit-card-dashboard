"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FilterState, CreditCard } from "@/types/card"
import {
  RotateCcw,
  UtensilsCrossed,
  ShoppingBasket,
  Plane,
  Fuel,
  Globe,
  Armchair,
  BedDouble,
  DollarSign,
  Filter,
} from "lucide-react"

export const AVAILABLE_ISSUERS = [
  "Chase",
  "American Express",
  "Capital One",
  "Citi",
  "Wells Fargo",
  "U.S. Bank",
  "Bilt",
  "Discover",
] as const

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (newFilters: FilterState) => void
  onResetFilters: () => void
  cards: CreditCard[]
  className?: string
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onResetFilters,
  cards,
  className,
}: FilterSidebarProps) {
  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.issuers.length > 0) count += filters.issuers.length
    if (filters.maxAnnualFee < 895) count += 1
    if (filters.categoryMultipliers.dining) count += 1
    if (filters.categoryMultipliers.groceries) count += 1
    if (filters.categoryMultipliers.flights) count += 1
    if (filters.categoryMultipliers.gas) count += 1
    if (filters.perks.noFtf) count += 1
    if (filters.perks.loungeAccess) count += 1
    if (filters.perks.freeNight) count += 1
    return count
  }, [filters])

  // Count cards per issuer
  const issuerCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    AVAILABLE_ISSUERS.forEach((issuer) => {
      counts[issuer] = cards.filter((c) => {
        if (issuer === "Bilt") return c.issuer.includes("Bilt")
        return c.issuer.toLowerCase() === issuer.toLowerCase()
      }).length
    })
    return counts
  }, [cards])

  const handleIssuerToggle = (issuer: string) => {
    const isSelected = filters.issuers.includes(issuer)
    const newIssuers = isSelected
      ? filters.issuers.filter((i) => i !== issuer)
      : [...filters.issuers, issuer]
    onFiltersChange({ ...filters, issuers: newIssuers })
  }

  const handleMultiplierToggle = (
    key: keyof FilterState["categoryMultipliers"],
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      categoryMultipliers: {
        ...filters.categoryMultipliers,
        [key]: checked,
      },
    })
  }

  const handlePerkToggle = (
    key: keyof FilterState["perks"],
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      perks: {
        ...filters.perks,
        [key]: checked,
      },
    })
  }

  const handleFeeChange = (val: number | readonly number[]) => {
    const num = Array.isArray(val) ? val[0] : (val as number)
    onFiltersChange({
      ...filters,
      maxAnnualFee: num,
    })
  }

  return (
    <aside className={className} data-slot="filter-sidebar">
      <div className="flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <span className="font-heading text-sm font-semibold text-foreground">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-1.5 text-[11px] font-bold"
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          )}
        </div>

        {/* 1. Annual Fee Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <DollarSign className="size-3.5 text-primary" />
              Max Annual Fee
            </label>
            <span className="rounded border bg-secondary px-2 py-0.5 font-mono text-xs font-bold text-secondary-foreground">
              {filters.maxAnnualFee === 0
                ? "$0 (No AF)"
                : `$${filters.maxAnnualFee}/yr`}
            </span>
          </div>

          <Slider
            min={0}
            max={895}
            step={5}
            value={[filters.maxAnnualFee]}
            onValueChange={handleFeeChange}
            className="w-full cursor-pointer py-1"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "$0", value: 0 },
              { label: "≤$95", value: 95 },
              { label: "≤$250", value: 250 },
              { label: "≤$395", value: 395 },
              { label: "All ($895)", value: 895 },
            ].map((preset) => {
              const active = filters.maxAnnualFee === preset.value
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    onFiltersChange({ ...filters, maxAnnualFee: preset.value })
                  }
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition-all ${
                    active
                      ? "border-primary bg-primary font-medium text-primary-foreground shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Issuer Checkboxes */}
        <div className="space-y-2.5 border-t pt-2">
          <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Card Issuer
          </label>
          <div className="space-y-2">
            {AVAILABLE_ISSUERS.map((issuer) => {
              const isChecked = filters.issuers.includes(issuer)
              const count = issuerCounts[issuer] || 0
              return (
                <label
                  key={issuer}
                  className="group flex cursor-pointer items-center justify-between py-0.5 text-sm select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleIssuerToggle(issuer)}
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isChecked
                          ? "font-medium text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {issuer}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground/70 group-hover:text-muted-foreground">
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* 3. Category Multipliers Toggles */}
        <div className="space-y-3 border-t pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Multipliers (≥ 3x)
            </label>
            <span className="text-[10px] text-muted-foreground">
              High yield
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                key: "dining" as const,
                label: "Dining",
                desc: "Restaurants & Takeout",
                icon: UtensilsCrossed,
              },
              {
                key: "groceries" as const,
                label: "Groceries",
                desc: "Supermarkets",
                icon: ShoppingBasket,
              },
              {
                key: "flights" as const,
                label: "Flights",
                desc: "Airlines & Portal",
                icon: Plane,
              },
              {
                key: "gas" as const,
                label: "Gas",
                desc: "Fuel & EV Charging",
                icon: Fuel,
              },
            ].map(({ key, label, desc, icon: Icon }) => {
              const isChecked = filters.categoryMultipliers[key]
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs leading-tight font-medium text-foreground">
                        {label} ≥ 3x
                      </div>
                      <div className="text-[10px] leading-tight text-muted-foreground">
                        {desc}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleMultiplierToggle(key, checked)
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Perks & Benefits Checkboxes */}
        <div className="space-y-2.5 border-t pt-2">
          <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Perks & Benefits
          </label>
          <div className="space-y-2">
            {[
              {
                key: "noFtf" as const,
                label: "0% Foreign Transaction Fee",
                sub: "Zero fees abroad",
                icon: Globe,
              },
              {
                key: "loungeAccess" as const,
                label: "Airport Lounge Access",
                sub: "Priority Pass / Centurion / Club",
                icon: Armchair,
              },
              {
                key: "freeNight" as const,
                label: "Free Night Award",
                sub: "Annual hotel certificates",
                icon: BedDouble,
              },
            ].map(({ key, label, sub, icon: Icon }) => {
              const isChecked = filters.perks[key]
              return (
                <label
                  key={key}
                  className="group flex cursor-pointer items-start gap-2.5 rounded-md px-1 py-1 text-sm transition-colors select-none hover:bg-muted/40"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlePerkToggle(key, Boolean(checked))
                    }
                    className="mt-0.5"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`flex items-center gap-1.5 text-xs leading-tight transition-colors ${
                        isChecked
                          ? "font-medium text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground/80">
                      {sub}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Clear Filters Button at Bottom */}
        <div className="border-t pt-2">
          <Button
            variant="outline"
            className="h-9 w-full justify-center gap-2 border-dashed text-xs"
            onClick={onResetFilters}
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="size-3.5" />
            Clear All Filters
          </Button>
        </div>
      </div>
    </aside>
  )
}
