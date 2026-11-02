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
  bonusEarnedDate?: string // YYYY-MM-DD (optional override for 48-mo, 15-mo bonus cooldowns)
  creditLimit?: number
  annualFee: number
  isCustom?: boolean
  notes?: string
}

export type IssuerRuleStatus = "eligible" | "warning" | "locked"

export interface RuleDetail {
  id: string
  name: string
  description: string
  status: IssuerRuleStatus
  currentCount?: number
  maxLimit?: number
  slotsRemaining?: number
  isUnderLimit: boolean
  cooldownActive: boolean
  daysRemaining?: number
  monthsRemaining?: number
  unlockDate?: string | null // YYYY-MM-DD
  unlockFormatted?: string | null // "Dec 15, 2026"
  progressPercent: number // 0 to 100
  contributingCards: {
    cardName: string
    openedDate: string
    bonusDate?: string
  }[]
  recommendation: string
}

export interface BankRuleGroup {
  issuerId: "chase" | "boa" | "wells-fargo" | "amex" | "capital-one" | "citi"
  issuerName: string
  logoShort: string
  logoStyle: {
    border: string
    badge: string
    text: string
  }
  overallStatus: IssuerRuleStatus
  statusMessage: string
  activeCooldownsCount: number
  rules: RuleDetail[]
}

export interface IssuerRulesSummary {
  banks: BankRuleGroup[]
  totalActiveCooldowns: number
  chase524: RuleDetail
  readyToApplyBankCount: number
  nextOverallUnlockDate: string | null
  nextOverallUnlockFormatted: string | null
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
  issuerRules?: IssuerRulesSummary
  activeMSRCount: number
  totalTargetSpend: number
  totalCurrentSpend: number
  totalCreditValue: number
  redeemedCreditValue: number
}
