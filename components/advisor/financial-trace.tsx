"use client"

import * as React from "react"
import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from "@/components/ui/trace"
import {
  Calculator,
  ShieldCheck,
  DollarSign,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FinancialTraceData {
  cardValuationMath?: string
  status524Check?: string
  feeVsRewardDelta?: string
}

interface FinancialTraceProps {
  trace: FinancialTraceData
  isRunning?: boolean
  className?: string
  defaultOpen?: boolean
}

export function FinancialTrace({
  trace,
  isRunning = false,
  className,
  defaultOpen = false,
}: FinancialTraceProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const hasContent = Boolean(
    trace.cardValuationMath || trace.status524Check || trace.feeVsRewardDelta
  )

  if (!hasContent && !isRunning) {
    return null
  }

  const stepsCount = [
    trace.cardValuationMath,
    trace.status524Check,
    trace.feeVsRewardDelta,
  ].filter(Boolean).length

  return (
    <div
      className={cn(
        "my-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 transition-colors",
        className
      )}
    >
      <Trace>
        <TraceCollapsible open={isOpen} onOpenChange={setIsOpen}>
          <TraceCollapsibleTrigger className="w-full justify-between rounded-md p-1.5 transition-colors hover:bg-muted/50">
            <TraceLine
              status={isRunning ? "running" : undefined}
              className="flex items-center gap-2"
            >
              <TraceIcon className="text-primary">
                {isRunning ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Sparkles className="size-3.5 text-primary" />
                )}
              </TraceIcon>
              <TraceTitle className="text-xs font-semibold text-foreground">
                Financial Reasoning & Strategy Trace
              </TraceTitle>
              <TraceDescription className="ml-1.5 text-[11px] text-muted-foreground">
                {isRunning
                  ? "Evaluating rules & valuations..."
                  : `${stepsCount} checks analyzed`}
              </TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>

          <TraceCollapsibleContent>
            <div className="space-y-3 pt-2 text-xs">
              {/* 1. Card Valuation Math */}
              <div className="rounded-md border border-border/50 bg-background/80 p-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calculator className="size-3.5 text-amber-500" />
                    <span>Card Valuation Math</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 px-1.5 py-0 text-[10px] text-amber-600 dark:text-amber-400"
                  >
                    Reward Multipliers
                  </Badge>
                </div>
                <div className="pt-2 leading-relaxed text-muted-foreground">
                  {trace.cardValuationMath || (
                    <span className="text-muted-foreground/60 italic">
                      Calculating point yields and cpp valuations...
                    </span>
                  )}
                </div>
              </div>

              {/* 2. 5/24 Status Check */}
              <div className="rounded-md border border-border/50 bg-background/80 p-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck className="size-3.5 text-blue-500" />
                    <span>Chase 5/24 & Issuer Underwriting Check</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 px-1.5 py-0 text-[10px] text-blue-600 dark:text-blue-400"
                  >
                    Rule Verification
                  </Badge>
                </div>
                <div className="pt-2 leading-relaxed text-muted-foreground">
                  {trace.status524Check || (
                    <span className="text-muted-foreground/60 italic">
                      Analyzing recent account openings and issuer rules...
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Fee vs Reward Delta */}
              <div className="rounded-md border border-border/50 bg-background/80 p-2.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <DollarSign className="size-3.5 text-emerald-500" />
                    <span>Fee vs. Reward Delta</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    Net Effective ROI
                  </Badge>
                </div>
                <div className="pt-2 leading-relaxed text-muted-foreground">
                  {trace.feeVsRewardDelta || (
                    <span className="text-muted-foreground/60 italic">
                      Computing statement credits and net holding costs...
                    </span>
                  )}
                </div>
              </div>

              {!isRunning && (
                <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-muted-foreground/70">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>
                    Ground truth verified against 35-card catalog and bank
                    disclosures.
                  </span>
                </div>
              )}
            </div>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    </div>
  )
}
