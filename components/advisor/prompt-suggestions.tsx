"use client"

import * as React from "react"
import { Utensils, ShieldCheck, DollarSign, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PromptSuggestionItem {
  id: string
  category: string
  prompt: string
  icon: React.ElementType
  colorClass: string
}

export const STARTER_PROMPTS: PromptSuggestionItem[] = [
  {
    id: "dining-travel",
    category: "Dining & Travel",
    prompt: "Which card should I get next for dining & travel?",
    icon: Utensils,
    colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "chase-524",
    category: "Chase 5/24 Rule",
    prompt: "How does the Chase 5/24 rule work?",
    icon: ShieldCheck,
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "annual-fees",
    category: "Annual Fees",
    prompt: "Are annual fees worth it for my budget?",
    icon: DollarSign,
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "groceries-cashback",
    category: "Groceries & Cash Back",
    prompt: "How do I earn the most cash back on groceries?",
    icon: ShoppingBag,
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
]

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void
  className?: string
  layout?: "grid" | "compact"
}

export function PromptSuggestions({
  onSelectPrompt,
  className,
  layout = "grid",
}: PromptSuggestionsProps) {
  if (layout === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {STARTER_PROMPTS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted hover:text-foreground hover:shadow-xs active:scale-[0.98]"
            >
              <Icon className="size-3 text-primary" />
              <span className="max-w-[280px] truncate sm:max-w-none">
                {item.prompt}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Popular Questions to Get Started
        </span>
        <span className="text-[11px] text-muted-foreground">Click to ask</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {STARTER_PROMPTS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border/70 bg-card/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card hover:shadow-sm active:translate-y-0"
            >
              <div className="flex w-full items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "border px-2 py-0.5 text-[10px] font-medium",
                    item.colorClass
                  )}
                >
                  <Icon className="mr-1 size-3" />
                  {item.category}
                </Badge>
                <span className="text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                  Ask &rarr;
                </span>
              </div>
              <p className="text-xs leading-snug font-medium text-foreground transition-colors group-hover:text-primary">
                &ldquo;{item.prompt}&rdquo;
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
