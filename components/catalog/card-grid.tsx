"use client"

import * as React from "react"
import { CreditCard } from "@/types/card"
import { CardTile } from "@/components/catalog/card-tile"
import { Button } from "@/components/ui/button"
import { SearchX, RotateCcw } from "lucide-react"

interface CardGridProps {
  cards: CreditCard[]
  onSelectCard: (card: CreditCard) => void
  onResetFilters: () => void
}

export function CardGrid({
  cards,
  onSelectCard,
  onResetFilters,
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-12 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground">
          No credit cards found
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t find any cards matching your active filters or search
          query. Try relaxing your annual fee limit or deselecting category
          multipliers.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={onResetFilters}
            className="h-9 gap-2 rounded-xl px-4 text-xs font-medium"
          >
            <RotateCcw className="size-3.5" />
            Reset All Filters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="card-grid"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <CardTile key={card.id} card={card} onSelect={onSelectCard} />
      ))}
    </div>
  )
}
