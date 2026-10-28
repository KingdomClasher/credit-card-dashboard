"use client"

import * as React from "react"
import { ValuationMode } from "@/lib/calculator"
import { Badge } from "@/components/ui/badge"
import { DollarSign, PlaneTakeoff, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValuationToggleProps {
  value: ValuationMode
  onChange: (mode: ValuationMode) => void
  className?: string
}

export function ValuationToggle({
  value,
  onChange,
  className,
}: ValuationToggleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Point Valuation Mode
        </label>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Info className="size-3" />
          <span>Affects transferable point conversions</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Conservative Cash Floor */}
        <button
          type="button"
          onClick={() => onChange("conservative")}
          className={cn(
            "relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === "conservative"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-colors",
                  value === "conservative"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <DollarSign className="size-4" />
              </div>
              <span className="font-heading text-sm font-semibold text-foreground">
                Conservative Cash Floor
              </span>
            </div>
            <Badge
              variant={value === "conservative" ? "default" : "secondary"}
              className="font-mono text-xs font-bold"
            >
              1.0 cpp
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Direct cash back, statement credits, or bank deposits. Safe baseline
            with zero award booking friction.
          </p>
        </button>

        {/* Transfer Partner Benchmark */}
        <button
          type="button"
          onClick={() => onChange("transfer")}
          className={cn(
            "relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === "transfer"
              ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg transition-colors",
                  value === "transfer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <PlaneTakeoff className="size-4" />
              </div>
              <span className="font-heading text-sm font-semibold text-foreground">
                Transfer Partner Benchmark
              </span>
            </div>
            <Badge
              variant={value === "transfer" ? "default" : "secondary"}
              className="font-mono text-xs font-bold"
            >
              1.8 cpp
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Outsized awards via airline & hotel partners (Hyatt, Virgin
            Atlantic, Air Canada Aeroplan, Flying Blue).
          </p>
        </button>
      </div>
    </div>
  )
}
