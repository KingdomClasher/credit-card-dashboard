/**
 * Shared Types Contract for User Wallet, Cards, MSR Campaigns, and Credits
 */

import type {
  User,
  NewUser,
  UserProfile,
  NewUserProfile,
  UserCard,
  NewUserCard,
  MSRCampaign,
  NewMSRCampaign,
  CreditRedemption,
  NewCreditRedemption,
} from "@/lib/db/schema"

import type {
  CreditCard,
  ForeignTransactionFee,
  SignupBonus,
  StatementCredit,
  RewardProgram,
  CardRates,
  SortOption,
  FilterState,
} from "@/types/card"

// Re-export Database Entities & Insert Types
export type {
  User,
  NewUser,
  UserProfile,
  NewUserProfile,
  UserCard,
  NewUserCard,
  MSRCampaign,
  NewMSRCampaign,
  CreditRedemption,
  NewCreditRedemption,
}

// Re-export Card Catalog Types
export type {
  CreditCard,
  ForeignTransactionFee,
  SignupBonus,
  StatementCredit,
  RewardProgram,
  CardRates,
  SortOption,
  FilterState,
}

/**
 * User card enriched with catalog metadata and associated campaigns/redemptions
 */
export interface UserCardWithDetails extends UserCard {
  cardDetails?: CreditCard
  msrCampaigns?: MSRCampaign[]
  creditRedemptions?: CreditRedemption[]
}

/**
 * Summary metrics of a user's wallet
 */
export interface WalletSummary {
  cards: UserCardWithDetails[]
  totalAnnualFees: number
  totalCreditLimit: number
  activeCampaignsCount: number
  totalCreditsValue: number
}

// Client-side Wallet and Pacing Tracker Types
export interface UserWalletCard {
  id: string
  cardSlug: string
  nickname?: string
  openedDate: string // YYYY-MM-DD
  creditLimit?: number
  annualFee: number
  isCustom?: boolean
  notes?: string
}

export interface MSRTrackerItem {
  id: string
  userCardId: string
  cardName: string
  targetSpend: number
  currentSpend: number
  deadlineDate: string // YYYY-MM-DD
  welcomeBonus: string
}

export interface CreditRedemptionItem {
  id: string
  userCardId: string
  cardName: string
  creditName: string
  amount: number
  frequency: string
  isRedeemed: boolean
  resetDate?: string
}

export interface FiveTwentyFourCardEntry {
  card: UserWalletCard
  catalogCard?: CreditCard
  openedDate: string
  dropOffDate: string // YYYY-MM-DD (typically 24 months from open or 1st of 25th month)
  dropOffMonthYear: string // e.g. "July 2027"
  monthsRemaining: number
  daysRemaining: number
  isUnder24Months: boolean
}

export interface FiveTwentyFourStatus {
  count: number
  slotsRemaining: number
  isUnderLimit: boolean
  nextDropOffDate: string | null
  formattedDropOff: string
  daysUntilNextDropOff: number | null
  cardsInWindow: FiveTwentyFourCardEntry[]
  cardsOutsideWindow: FiveTwentyFourCardEntry[]
}

export interface WalletSummaryMetrics {
  totalAnnualFees: number
  totalCreditLimit: number
  fiveTwentyFour: FiveTwentyFourStatus
  activeMSRCount: number
  totalTargetSpend: number
  totalCurrentSpend: number
  totalCreditValue: number
  redeemedCreditValue: number
}
