import type { Metadata } from "next"
import cardsData from "@/app/data/cards.json"
import { CreditCard } from "@/types/card"
import { CatalogView } from "@/components/catalog/catalog-view"

export const metadata: Metadata = {
  title: "Credit Card Catalog & Reward Optimizer",
  description:
    "Explore 35 premier credit cards with live multiplier math, statement credits, welcome bonus value, and real-time filtering.",
}

export default function Page() {
  const cards = cardsData as unknown as CreditCard[]

  return <CatalogView cards={cards} />
}
