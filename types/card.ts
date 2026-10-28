export interface ForeignTransactionFee {
  hasFee: boolean
  rate: string
}

export interface SignupBonus {
  amount: string
  unit: string
  spendRequirement: number
  timeframeMonths: number
  estimatedValueUsd: number
  historicalHigh?: string
  description: string
}

export interface StatementCredit {
  name: string
  amount: number
  frequency: string
  description: string
}

export interface RewardProgram {
  name: string
  currency: string
  transferable: boolean
  estimatedCpp: number
  cashFloorCpp: number
  topPartners?: string[]
}

export interface CardRates {
  dining?: number
  groceries?: number
  flights?: number
  hotels?: number
  travel_portal?: number
  gas?: number
  transit?: number
  streaming?: number
  catch_all?: number
  [key: string]: number | undefined
}

export interface CreditCard {
  id: string
  name: string
  issuer: string
  network: string
  tier: string
  category: string
  annualFee: number
  authorizedUserFee: number
  foreignTransactionFee: ForeignTransactionFee
  creditScoreRequired: string
  rating: number
  recommended?: boolean
  signupBonus: SignupBonus
  multipliers: Record<string, string>
  rates: CardRates
  credits?: StatementCredit[]
  perks: string[]
  rewardProgram: RewardProgram
  rules: string[]
  summary: string
  bestFor: string
  pros: string[]
  cons: string[]
}

export type SortOption = "rating" | "fee-asc" | "fee-desc" | "bonus-desc"

export interface FilterState {
  searchQuery: string
  issuers: string[]
  maxAnnualFee: number
  categoryMultipliers: {
    dining: boolean
    groceries: boolean
    flights: boolean
    gas: boolean
  }
  perks: {
    noFtf: boolean
    loungeAccess: boolean
    freeNight: boolean
  }
  sortBy: SortOption
}
