"use client"

import * as React from "react"
import {
  MonthlySpend,
  SpendCategory,
  SPEND_CATEGORIES,
  PERSONA_PRESETS,
} from "@/lib/calculator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Utensils,
  ShoppingCart,
  Plane,
  Building2,
  Compass,
  Fuel,
  Train,
  Tv,
  CreditCard,
  RotateCcw,
  Sparkles,
  DollarSign,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SpendInputMatrixProps {
  spend: MonthlySpend
  onChange: (spend: MonthlySpend) => void
  className?: string
}

const CATEGORY_ICONS: Record<
  SpendCategory,
  React.ComponentType<{ className?: string }>
> = {
  dining: Utensils,
  groceries: ShoppingCart,
  flights: Plane,
  hotels: Building2,
  travel_portal: Compass,
  gas: Fuel,
  transit: Train,
  streaming: Tv,
  catch_all: CreditCard,
}

export function SpendInputMatrix({
  spend,
  onChange,
  className,
}: SpendInputMatrixProps) {
  // Calculate total monthly and annual spend
  const totalMonthlySpend = React.useMemo(() => {
    return Object.values(spend).reduce((sum, v) => sum + (v || 0), 0)
  }, [spend])

  const totalAnnualSpend = totalMonthlySpend * 12

  // Detect which persona preset matches (if any)
  const activePresetId = React.useMemo(() => {
    for (const preset of PERSONA_PRESETS) {
      const matches = (Object.keys(preset.spend) as SpendCategory[]).every(
        (cat) => (spend[cat] || 0) === (preset.spend[cat] || 0)
      )
      if (matches) return preset.id
    }
    return null
  }, [spend])

  const handleCategoryChange = (cat: SpendCategory, amount: number) => {
    onChange({
      ...spend,
      [cat]: Math.max(0, Math.round(amount)),
    })
  }

  const handlePresetSelect = (presetId: string) => {
    const preset = PERSONA_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      onChange(preset.spend)
    }
  }

  const handleReset = () => {
    const zeroSpend: MonthlySpend = {
      dining: 0,
      groceries: 0,
      flights: 0,
      hotels: 0,
      travel_portal: 0,
      gas: 0,
      transit: 0,
      streaming: 0,
      catch_all: 0,
    }
    onChange(zeroSpend)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header & Persona Preset Bar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Persona Spending Presets
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a spending profile or calibrate custom category budgets
              below.
            </p>
          </div>
          {totalMonthlySpend > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1 self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
            >
              <RotateCcw className="size-3" />
              Reset Spend
            </Button>
          )}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PERSONA_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-xl border p-2.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-bold text-foreground">
                    {preset.name}
                  </span>
                  {isActive && (
                    <Sparkles className="size-3 animate-pulse text-primary" />
                  )}
                </div>
                <span className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  {preset.tagline}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spend Total Summary Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Wallet className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Total Budget
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-base font-bold text-foreground sm:text-lg">
                ${totalMonthlySpend.toLocaleString()}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / month
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                (${totalAnnualSpend.toLocaleString()} / year)
              </span>
            </div>
          </div>
        </div>

        {activePresetId ? (
          <Badge variant="outline" className="h-6 font-medium">
            Active: {PERSONA_PRESETS.find((p) => p.id === activePresetId)?.name}
          </Badge>
        ) : (
          <Badge variant="secondary" className="h-6 font-medium">
            Custom Budget
          </Badge>
        )}
      </div>

      {/* 9 Category Inputs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Monthly Category Breakdown (9 Categories)
          </span>
          <span className="text-[11px] text-muted-foreground">
            Adjust slider or enter exact dollar amount
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SPEND_CATEGORIES.map((catConfig) => {
            const Icon = CATEGORY_ICONS[catConfig.id]
            const currentValue = spend[catConfig.id] || 0
            const maxRange = Math.max(catConfig.defaultMax, currentValue)

            return (
              <div
                key={catConfig.id}
                className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-2xs transition-colors hover:border-border"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        {catConfig.shortLabel}
                      </div>
                      <div className="line-clamp-1 text-[10px] text-muted-foreground">
                        {catConfig.description}
                      </div>
                    </div>
                  </div>

                  {/* Number Input with Dollar Sign */}
                  <div className="relative w-24 shrink-0">
                    <DollarSign className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      min={0}
                      max={20000}
                      step={catConfig.step}
                      value={currentValue === 0 ? "" : currentValue}
                      placeholder="0"
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value)
                        handleCategoryChange(catConfig.id, val)
                      }}
                      className="h-7 pr-2 pl-6 text-right font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={maxRange}
                    step={catConfig.step}
                    value={[currentValue]}
                    onValueChange={(val) => {
                      const num = Array.isArray(val) ? val[0] : (val as number)
                      handleCategoryChange(catConfig.id, num)
                    }}
                    className="w-full cursor-pointer py-1"
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>$0</span>
                    <span>${maxRange.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
