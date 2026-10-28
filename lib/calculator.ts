import { CreditCard, StatementCredit } from "@/types/card"

export type SpendCategory =
  | "dining"
  | "groceries"
  | "flights"
  | "hotels"
  | "travel_portal"
  | "gas"
  | "transit"
  | "streaming"
  | "catch_all"

export type MonthlySpend = Record<SpendCategory, number>

export type ValuationMode = "conservative" | "transfer"

export interface SpendCategoryConfig {
  id: SpendCategory
  label: string
  shortLabel: string
  defaultMax: number
  step: number
  description: string
}

export const SPEND_CATEGORIES: SpendCategoryConfig[] = [
  {
    id: "dining",
    label: "Dining & Restaurants",
    shortLabel: "Dining",
    defaultMax: 3000,
    step: 25,
    description: "Restaurants, cafes, bars, DoorDash, Uber Eats",
  },
  {
    id: "groceries",
    label: "Groceries & Supermarkets",
    shortLabel: "Groceries",
    defaultMax: 3000,
    step: 25,
    description: "Supermarkets, grocery stores, food delivery",
  },
  {
    id: "flights",
    label: "Flights (Direct Airline)",
    shortLabel: "Flights",
    defaultMax: 5000,
    step: 50,
    description: "Airfare booked directly with airlines",
  },
  {
    id: "hotels",
    label: "Hotels (Direct Booking)",
    shortLabel: "Hotels",
    defaultMax: 3000,
    step: 50,
    description: "Lodging booked directly with hotel brands",
  },
  {
    id: "travel_portal",
    label: "Portal Travel",
    shortLabel: "Portal Travel",
    defaultMax: 3000,
    step: 50,
    description: "Bookings via Chase, Amex, or Capital One Travel",
  },
  {
    id: "gas",
    label: "Gas & EV Charging",
    shortLabel: "Gas/EV",
    defaultMax: 1500,
    step: 25,
    description: "Gas stations, EV fast chargers",
  },
  {
    id: "transit",
    label: "Transit & Commuting",
    shortLabel: "Transit",
    defaultMax: 1500,
    step: 25,
    description: "Rideshare (Uber/Lyft), subways, passenger trains, tolls",
  },
  {
    id: "streaming",
    label: "Streaming & Entertainment",
    shortLabel: "Streaming",
    defaultMax: 500,
    step: 10,
    description: "Netflix, Disney+, Hulu, Spotify, YouTube",
  },
  {
    id: "catch_all",
    label: "Catch-All / Everyday Spend",
    shortLabel: "Catch-All",
    defaultMax: 5000,
    step: 50,
    description: "Medical, utilities, retail, unbonused general spend",
  },
]

export interface PersonaPreset {
  id: string
  name: string
  tagline: string
  description: string
  spend: MonthlySpend
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: "urban-foodie",
    name: "Urban Foodie",
    tagline: "Dining, transit, and city living",
    description:
      "$800 Dining, $400 Grocery, $300 Flights, $200 Hotels, $150 Transit, $50 Streaming, $500 Catch-all",
    spend: {
      dining: 800,
      groceries: 400,
      flights: 300,
      hotels: 200,
      travel_portal: 0,
      gas: 0,
      transit: 150,
      streaming: 50,
      catch_all: 500,
    },
  },
  {
    id: "suburban-commuter",
    name: "Suburban Commuter",
    tagline: "Family groceries, gas, and utilities",
    description:
      "$400 Dining, $1,000 Grocery, $100 Flights, $100 Hotels, $350 Gas, $60 Streaming, $1,200 Catch-all",
    spend: {
      dining: 400,
      groceries: 1000,
      flights: 100,
      hotels: 100,
      travel_portal: 0,
      gas: 350,
      transit: 0,
      streaming: 60,
      catch_all: 1200,
    },
  },
  {
    id: "business-flyer",
    name: "Business Flyer",
    tagline: "Frequent flights, upscale hotels, and client dinners",
    description:
      "$1,200 Dining, $300 Grocery, $1,500 Flights, $1,000 Hotels, $200 Gas, $300 Transit, $2,000 Catch-all",
    spend: {
      dining: 1200,
      groceries: 300,
      flights: 1500,
      hotels: 1000,
      travel_portal: 0,
      gas: 200,
      transit: 300,
      streaming: 0,
      catch_all: 2000,
    },
  },
  {
    id: "frugal-maximizer",
    name: "Frugal Maximizer",
    tagline: "Essential spend with zero or low fee optimization",
    description:
      "$200 Dining, $400 Grocery, $50 Flights, $50 Hotels, $150 Gas, $30 Streaming, $600 Catch-all",
    spend: {
      dining: 200,
      groceries: 400,
      flights: 50,
      hotels: 50,
      travel_portal: 0,
      gas: 150,
      transit: 0,
      streaming: 30,
      catch_all: 600,
    },
  },
]

export const DEFAULT_MONTHLY_SPEND: MonthlySpend = PERSONA_PRESETS[0].spend

export type CreditUtilityState = Record<
  string,
  {
    enabled: boolean
    utilityWeight: number // 0.0 to 1.0
  }
>

/**
 * Determines CPP valuation based on selected mode and card reward program attributes.
 * - Conservative Cash Floor: 1.0 cpp (or lower if co-branded hotel has lower floor e.g. Hilton 0.3)
 * - Transfer Partner Benchmark: 1.8 cpp for transferable currencies; card's estimatedCpp for hotel/airline; 1.0 for cash back
 */
export function getCardCpp(
  card: CreditCard,
  valuationMode: ValuationMode
): number {
  if (valuationMode === "conservative") {
    if (
      card.rewardProgram?.cashFloorCpp !== undefined &&
      card.rewardProgram.cashFloorCpp < 1.0
    ) {
      return card.rewardProgram.cashFloorCpp
    }
    return 1.0
  }

  // Transfer partner benchmark mode:
  if (card.rewardProgram?.transferable) {
    return 1.8 // Transfer Partner Benchmark
  }

  // Non-transferable co-branded hotel or airline cards (Hyatt 1.6, Delta 1.2, Marriott 0.8, etc.)
  if (
    card.rewardProgram?.estimatedCpp &&
    card.rewardProgram.estimatedCpp !== 1.0
  ) {
    return card.rewardProgram.estimatedCpp
  }

  // Pure cash back cards remain 1.0 cpp floor
  return 1.0
}

/**
 * Calculates annual points earned: 12 * sum(spend_category * multiplier_category)
 */
export function calculateAnnualPointYield(
  card: CreditCard,
  spend: MonthlySpend
): number {
  let monthlyPoints = 0
  const categories: SpendCategory[] = [
    "dining",
    "groceries",
    "flights",
    "hotels",
    "travel_portal",
    "gas",
    "transit",
    "streaming",
    "catch_all",
  ]

  for (const cat of categories) {
    const monthlySpendForCat = spend[cat] || 0
    const multiplier = card.rates?.[cat] ?? card.rates?.catch_all ?? 1
    monthlyPoints += monthlySpendForCat * multiplier
  }

  return Math.round(monthlyPoints * 12)
}

/**
 * Gross Dollar Value: annual_points * (cpp_valuation / 100)
 */
export function calculateGrossDollarValue(
  annualPoints: number,
  cppValuation: number
): number {
  return (annualPoints * cppValuation) / 100
}

/**
 * Ingest statement credits from card.credits or card.annual_credits
 */
export function getCardCredits(card: CreditCard): StatementCredit[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = card.credits || (card as any).annual_credits || []
  return Array.isArray(raw) ? raw : []
}

/**
 * Calculates utilized statement credits: sum(credit_amount * utility_weight)
 */
export function getCardUtilizedCredits(
  card: CreditCard,
  creditOverrides?: CreditUtilityState
): number {
  const credits = getCardCredits(card)
  if (!credits.length) return 0

  return credits.reduce((sum, credit, idx) => {
    const key = `${card.id}::${idx}::${credit.name}`
    const override = creditOverrides?.[key]

    const enabled = override !== undefined ? override.enabled : true
    const utilityWeight = override !== undefined ? override.utilityWeight : 1.0 // default 100% face value

    if (!enabled) return sum
    return sum + (credit.amount || 0) * utilityWeight
  }, 0)
}

/**
 * Net Effective Fee: annual_fee - sum(credit_amount * utility_weight)
 */
export function calculateNetEffectiveFee(
  card: CreditCard,
  creditOverrides?: CreditUtilityState
): number {
  const annualFee = card.annualFee || 0
  const utilizedCredits = getCardUtilizedCredits(card, creditOverrides)
  return annualFee - utilizedCredits
}

/**
 * Net Annual Value: gross_dollar_value + utilized_credits - annual_fee
 */
export function calculateNetAnnualValue(
  grossDollarValue: number,
  annualFee: number,
  utilizedCredits: number
): number {
  return grossDollarValue + utilizedCredits - annualFee
}

export interface CardRewardBreakdown {
  card: CreditCard
  annualPoints: number
  monthlyPoints: number
  cppValuation: number
  grossDollarValue: number
  annualFee: number
  utilizedCredits: number
  netEffectiveFee: number
  netAnnualValue: number
  topCategory: {
    category: SpendCategory
    label: string
    rate: number
  }
}

const CATEGORY_LABELS: Record<SpendCategory, string> = {
  dining: "Dining",
  groceries: "Groceries",
  flights: "Flights",
  hotels: "Hotels",
  travel_portal: "Portal Travel",
  gas: "Gas / EV",
  transit: "Transit",
  streaming: "Streaming",
  catch_all: "Everyday Spend",
}

/**
 * Determines the top earning multiplier category for a card
 */
export function getCardTopCategory(card: CreditCard): {
  category: SpendCategory
  label: string
  rate: number
} {
  const categories: SpendCategory[] = [
    "travel_portal",
    "flights",
    "hotels",
    "dining",
    "groceries",
    "gas",
    "transit",
    "streaming",
    "catch_all",
  ]

  let bestCat: SpendCategory = "catch_all"
  let bestRate = card.rates?.catch_all ?? 1

  for (const cat of categories) {
    const rate = card.rates?.[cat]
    if (rate !== undefined && rate > bestRate) {
      bestRate = rate
      bestCat = cat
    }
  }

  return {
    category: bestCat,
    label: CATEGORY_LABELS[bestCat] || bestCat,
    rate: bestRate,
  }
}

/**
 * Comprehensive calculator computation for a card
 */
export function calculateCardRewards(
  card: CreditCard,
  spend: MonthlySpend,
  valuationMode: ValuationMode,
  creditOverrides?: CreditUtilityState,
  customCpp?: number
): CardRewardBreakdown {
  const annualPoints = calculateAnnualPointYield(card, spend)
  const cppValuation =
    customCpp !== undefined ? customCpp : getCardCpp(card, valuationMode)
  const grossDollarValue = calculateGrossDollarValue(annualPoints, cppValuation)
  const annualFee = card.annualFee || 0
  const utilizedCredits = getCardUtilizedCredits(card, creditOverrides)
  const netEffectiveFee = calculateNetEffectiveFee(card, creditOverrides)
  const netAnnualValue = calculateNetAnnualValue(
    grossDollarValue,
    annualFee,
    utilizedCredits
  )
  const topCategory = getCardTopCategory(card)

  return {
    card,
    annualPoints,
    monthlyPoints: Math.round(annualPoints / 12),
    cppValuation,
    grossDollarValue,
    annualFee,
    utilizedCredits,
    netEffectiveFee,
    netAnnualValue,
    topCategory,
  }
}
