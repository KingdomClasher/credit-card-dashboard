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
