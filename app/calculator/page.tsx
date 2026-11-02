import { Metadata } from "next"
import cardsData from "@/app/data/cards.json"
import { CreditCard } from "@/types/card"
import { CalculatorView } from "@/components/calculator/calculator-view"

export const metadata: Metadata = {
  title: "Net Value & Rewards Calculator | Credit Card Dashboard",
  description:
    "Model your monthly spending across 9 categories, toggle valuation modes, and calculate true net holding costs with our statement credit analyzer.",
}

export default function CalculatorPage() {
  const cards = cardsData as unknown as CreditCard[]

  return <CalculatorView cards={cards} />
}
