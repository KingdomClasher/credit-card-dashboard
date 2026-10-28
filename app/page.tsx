import cardsData from "@/app/data/cards.json"
import { CreditCard } from "@/types/card"
import { CatalogView } from "@/components/catalog/catalog-view"

export default function Page() {
  const cards = cardsData as unknown as CreditCard[]

  return <CatalogView cards={cards} />
}
