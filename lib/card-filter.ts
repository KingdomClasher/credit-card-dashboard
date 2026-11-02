import { CreditCard, FilterState } from "@/types/card"

export const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  issuers: [],
  maxAnnualFee: 895,
  quickCategory: "all",
  categoryMultipliers: {
    dining: false,
    groceries: false,
    flights: false,
    gas: false,
  },
  perks: {
    noFtf: false,
    loungeAccess: false,
    freeNight: false,
  },
  sortBy: "rating",
}

export function filterAndSortCards(
  cards: CreditCard[],
  filters: FilterState
): CreditCard[] {
  const query = filters.searchQuery.trim().toLowerCase()

  const filtered = cards.filter((card) => {
    // 0. Quick Category Filter (Mobile & Fast Navigation Strip)
    if (filters.quickCategory && filters.quickCategory !== "all") {
      switch (filters.quickCategory) {
        case "travel": {
          const isTravel =
            card.category.includes("travel") ||
            card.tier.toLowerCase().includes("travel") ||
            (card.rates.flights ?? 0) >= 3 ||
            (card.rates.travel ?? 0) >= 2 ||
            (card.perks || []).some((p) =>
              /lounge|tsa|global entry|airline|flight|hotel/i.test(p)
            )
          if (!isTravel) return false
          break
        }
        case "dining": {
          const isDining =
            (card.rates.dining ?? 0) >= 3 ||
            card.category.includes("dining") ||
            card.tier.toLowerCase().includes("dining")
          if (!isDining) return false
          break
        }
        case "groceries": {
          const isGroceries =
            (card.rates.groceries ?? 0) >= 3 ||
            card.category.includes("grocery") ||
            card.tier.toLowerCase().includes("grocery")
          if (!isGroceries) return false
          break
        }
        case "zero_fee": {
          if (card.annualFee !== 0) return false
          break
        }
        case "cash_back": {
          const isCashBack =
            card.category.includes("cash") ||
            card.tier.toLowerCase().includes("cash") ||
            card.rewardProgram.currency.toLowerCase().includes("cash")
          if (!isCashBack) return false
          break
        }
      }
    }

    // 1. Text Search Filter
    if (query) {
      const cardText = [
        card.name,
        card.issuer,
        card.summary,
        card.signupBonus.description,
        card.rewardProgram.name,
        card.rewardProgram.currency,
        card.tier,
        card.bestFor,
        ...(card.perks || []),
      ]
        .join(" ")
        .toLowerCase()

      // Split query into words to support multi-word search
      const queryWords = query.split(/\s+/).filter(Boolean)
      const matchesAllWords = queryWords.every((word) =>
        cardText.includes(word)
      )
      if (!matchesAllWords) return false
    }

    // 2. Issuer Filter
    if (filters.issuers.length > 0) {
      const matchesIssuer = filters.issuers.some((issuer) => {
        if (issuer === "Bilt") return card.issuer.includes("Bilt")
        return card.issuer.toLowerCase() === issuer.toLowerCase()
      })
      if (!matchesIssuer) return false
    }

    // 3. Annual Fee Slider Filter
    if (card.annualFee > filters.maxAnnualFee) {
      return false
    }

    // 4. Category Multipliers Filter (>= 3x)
    if (filters.categoryMultipliers.dining && (card.rates.dining ?? 0) < 3) {
      return false
    }
    if (
      filters.categoryMultipliers.groceries &&
      (card.rates.groceries ?? 0) < 3
    ) {
      return false
    }
    if (filters.categoryMultipliers.flights && (card.rates.flights ?? 0) < 3) {
      return false
    }
    if (filters.categoryMultipliers.gas && (card.rates.gas ?? 0) < 3) {
      return false
    }

    // 5. Perks & Benefits Filter
    if (filters.perks.noFtf) {
      const isNoFtf =
        card.foreignTransactionFee.hasFee === false ||
        card.foreignTransactionFee.rate === "0%"
      if (!isNoFtf) return false
    }

    if (filters.perks.loungeAccess) {
      const loungeText = [
        ...(card.perks || []),
        ...(card.credits?.map((c) => c.name + " " + c.description) || []),
      ].join(" ")
      const hasLounge =
        /lounge|priority pass|centurion|united club|sky club|admiral/i.test(
          loungeText
        )
      if (!hasLounge) return false
    }

    if (filters.perks.freeNight) {
      const hotelText = [
        ...(card.perks || []),
        ...(card.credits?.map((c) => c.name + " " + c.description) || []),
      ].join(" ")
      const hasFreeNight = /free night|anniversary night|4th night free/i.test(
        hotelText
      )
      if (!hasFreeNight) return false
    }

    return true
  })

  // 6. Sorting
  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case "fee-asc":
        return a.annualFee - b.annualFee
      case "fee-desc":
        return b.annualFee - a.annualFee
      case "bonus-desc":
        return (
          (b.signupBonus.estimatedValueUsd || 0) -
          (a.signupBonus.estimatedValueUsd || 0)
        )
      case "rating":
      default:
        return b.rating - a.rating
    }
  })
}
