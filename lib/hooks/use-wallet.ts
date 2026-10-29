"use client"

import * as React from "react"
import cardsData from "@/app/data/cards.json"
import { CreditCard } from "@/types/card"
import {
  UserWalletCard,
  MSRTrackerItem,
  CreditRedemptionItem,
  FiveTwentyFourStatus,
  FiveTwentyFourCardEntry,
  WalletSummaryMetrics,
} from "@/lib/types/wallet"

const allCards = cardsData as unknown as CreditCard[]

const WALLET_CARDS_KEY = "cc_dashboard_wallet_cards_v2"
const MSR_ITEMS_KEY = "cc_dashboard_wallet_msr_v2"
const CREDIT_ITEMS_KEY = "cc_dashboard_wallet_credits_v2"

// Helper to format Date to YYYY-MM-DD
function formatDateISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Generate dates relative to current date so demo cards are always realistic
function getDemoDate(monthsAgo: number, dayOfMonth: number = 15): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth)
  return formatDateISO(d)
}

function getDemoDeadline(monthsAhead: number, dayOfMonth: number = 20): string {
  const now = new Date()
  const d = new Date(
    now.getFullYear(),
    now.getMonth() + monthsAhead,
    dayOfMonth
  )
  return formatDateISO(d)
}

// Pre-populated demo cards per spec:
// 1. Amex Gold opened 8 months ago ($325 AF, statement credits)
// 2. Chase Sapphire Preferred opened 3 months ago with active MSR ($95 AF, active MSR)
// 3. Capital One Venture X opened 15 months ago ($395 AF, statement credits) - gives 3/24!
// 4. Chase Freedom Unlimited opened 28 months ago ($0 AF) - aged out of 5/24 window (>24 mo)
export const INITIAL_DEMO_CARDS: UserWalletCard[] = [
  {
    id: "wallet-amex-gold",
    cardSlug: "amex-gold",
    nickname: "Everyday Dining & Groceries",
    openedDate: getDemoDate(8, 14),
    creditLimit: 25000,
    annualFee: 325,
    isCustom: false,
    notes: "Main card for US Supermarkets (4x) and Dining worldwide (4x).",
  },
  {
    id: "wallet-chase-sapphire-preferred",
    cardSlug: "chase-sapphire-preferred",
    nickname: "Travel Hub & Chase Anchor",
    openedDate: getDemoDate(3, 20),
    creditLimit: 17500,
    annualFee: 95,
    isCustom: false,
    notes:
      "Primary card for travel transfer partners. Working on sign-up bonus.",
  },
  {
    id: "wallet-capital-one-venture-x",
    cardSlug: "capital-one-venture-x",
    nickname: "Catch-All 2x & Lounge Access",
    openedDate: getDemoDate(15, 10),
    creditLimit: 30000,
    annualFee: 395,
    isCustom: false,
    notes:
      "2x catch-all everywhere, Priority Pass lounges, and $300 annual travel portal credit.",
  },
  {
    id: "wallet-chase-freedom-unlimited",
    cardSlug: "chase-freedom-unlimited",
    nickname: "Oldest Chase Account",
    openedDate: getDemoDate(28, 5),
    creditLimit: 14000,
    annualFee: 0,
    isCustom: false,
    notes:
      "No-fee keeper card. Aged past 24 months, so it does not count against Chase 5/24.",
  },
]

export const INITIAL_DEMO_MSR: MSRTrackerItem[] = [
  {
    id: "msr-csp-1",
    userCardId: "wallet-chase-sapphire-preferred",
    cardName: "Chase Sapphire Preferred® Card",
    targetSpend: 5000,
    currentSpend: 3650,
    deadlineDate: getDemoDeadline(1, 15),
    welcomeBonus: "75,000 Ultimate Rewards points (~$1,350 value)",
  },
]

export const INITIAL_DEMO_CREDITS: CreditRedemptionItem[] = [
  {
    id: "credit-amex-dining",
    userCardId: "wallet-amex-gold",
    cardName: "American Express® Gold Card",
    creditName: "Dining Statement Credit ($10/mo)",
    amount: 120,
    frequency: "monthly",
    isRedeemed: true,
    resetDate: "Monthly on 1st",
  },
  {
    id: "credit-amex-uber",
    userCardId: "wallet-amex-gold",
    cardName: "American Express® Gold Card",
    creditName: "Uber Cash ($10/mo)",
    amount: 120,
    frequency: "monthly",
    isRedeemed: true,
    resetDate: "Monthly on 1st",
  },
  {
    id: "credit-amex-resy",
    userCardId: "wallet-amex-gold",
    cardName: "American Express® Gold Card",
    creditName: "Resy Credit ($50 semi-annual)",
    amount: 100,
    frequency: "semi-annual",
    isRedeemed: false,
    resetDate: "Dec 31, 2026",
  },
  {
    id: "credit-amex-dunkin",
    userCardId: "wallet-amex-gold",
    cardName: "American Express® Gold Card",
    creditName: "Dunkin' Credit ($7/mo)",
    amount: 84,
    frequency: "monthly",
    isRedeemed: false,
    resetDate: "Monthly on 1st",
  },
  {
    id: "credit-csp-hotel",
    userCardId: "wallet-chase-sapphire-preferred",
    cardName: "Chase Sapphire Preferred® Card",
    creditName: "Annual Chase Travel Hotel Credit",
    amount: 50,
    frequency: "annual",
    isRedeemed: true,
    resetDate: "Anniversary Date",
  },
  {
    id: "credit-vx-travel",
    userCardId: "wallet-capital-one-venture-x",
    cardName: "Capital One Venture X Rewards Credit Card",
    creditName: "Annual Travel Portal Credit",
    amount: 300,
    frequency: "annual",
    isRedeemed: true,
    resetDate: "Anniversary Date",
  },
  {
    id: "credit-vx-anniversary",
    userCardId: "wallet-capital-one-venture-x",
    cardName: "Capital One Venture X Rewards Credit Card",
    creditName: "10,000 Anniversary Miles ($100 Value)",
    amount: 100,
    frequency: "annual",
    isRedeemed: false,
    resetDate: "Anniversary Date",
  },
]

// Calculate 5/24 status dynamically based on cards and rolling 24 months
export function calculate524Status(
  cards: UserWalletCard[],
  catalogCards: CreditCard[] = allCards,
  referenceDate: Date = new Date()
): FiveTwentyFourStatus {
  const cardsInWindow: FiveTwentyFourCardEntry[] = []
  const cardsOutsideWindow: FiveTwentyFourCardEntry[] = []

  // 24 months cutoff date
  const cutoffDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 24,
    referenceDate.getDate()
  )

  for (const card of cards) {
    if (!card.openedDate) continue

    const opened = new Date(card.openedDate + "T00:00:00")
    if (isNaN(opened.getTime())) continue

    // Drop-off occurs 24 calendar months after opening
    // In Chase practice, the card drops off on the 1st of the 25th month following opening
    const dropOff = new Date(opened.getFullYear() + 2, opened.getMonth() + 1, 1)

    const isUnder24 = opened >= cutoffDate && dropOff > referenceDate

    const dropOffMonthYear = dropOff.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })

    const diffMs = dropOff.getTime() - referenceDate.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const monthsRemaining = Math.max(0, Math.ceil(daysRemaining / 30.44))

    const catalogCard = catalogCards.find((c) => c.id === card.cardSlug)

    const entry: FiveTwentyFourCardEntry = {
      card,
      catalogCard,
      openedDate: card.openedDate,
      dropOffDate: formatDateISO(dropOff),
      dropOffMonthYear,
      monthsRemaining,
      daysRemaining,
      isUnder24Months: isUnder24,
    }

    if (isUnder24) {
      cardsInWindow.push(entry)
    } else {
      cardsOutsideWindow.push(entry)
    }
  }

  // Sort cards in window by dropOffDate ascending (earliest to drop off first)
  cardsInWindow.sort(
    (a, b) =>
      new Date(a.dropOffDate).getTime() - new Date(b.dropOffDate).getTime()
  )

  const count = cardsInWindow.length
  const slotsRemaining = Math.max(0, 5 - count)
  const isUnderLimit = count < 5

  let nextDropOffDate: string | null = null
  let formattedDropOff = "No drop-off pending"
  let daysUntilNextDropOff: number | null = null

  if (cardsInWindow.length > 0) {
    const earliest = cardsInWindow[0]
    nextDropOffDate = earliest.dropOffDate
    formattedDropOff = earliest.dropOffMonthYear
    daysUntilNextDropOff = earliest.daysRemaining
  }

  return {
    count,
    slotsRemaining,
    isUnderLimit,
    nextDropOffDate,
    formattedDropOff,
    daysUntilNextDropOff,
    cardsInWindow,
    cardsOutsideWindow,
  }
}

// External Store Pattern for SSR-safe and cascading-render-free state
interface WalletState {
  cards: UserWalletCard[]
  msrItems: MSRTrackerItem[]
  creditItems: CreditRedemptionItem[]
}

const listeners = new Set<() => void>()
let cachedWalletState: WalletState | null = null

function emitWalletChange() {
  for (const listener of listeners) {
    listener()
  }
}

function getWalletSnapshot(): WalletState {
  if (cachedWalletState) return cachedWalletState

  if (typeof window === "undefined") {
    return {
      cards: INITIAL_DEMO_CARDS,
      msrItems: INITIAL_DEMO_MSR,
      creditItems: INITIAL_DEMO_CREDITS,
    }
  }

  try {
    const savedCards = localStorage.getItem(WALLET_CARDS_KEY)
    const savedMSR = localStorage.getItem(MSR_ITEMS_KEY)
    const savedCredits = localStorage.getItem(CREDIT_ITEMS_KEY)

    const cards = savedCards ? JSON.parse(savedCards) : INITIAL_DEMO_CARDS
    const msrItems = savedMSR ? JSON.parse(savedMSR) : INITIAL_DEMO_MSR
    const creditItems = savedCredits
      ? JSON.parse(savedCredits)
      : INITIAL_DEMO_CREDITS

    if (!savedCards)
      localStorage.setItem(WALLET_CARDS_KEY, JSON.stringify(cards))
    if (!savedMSR) localStorage.setItem(MSR_ITEMS_KEY, JSON.stringify(msrItems))
    if (!savedCredits)
      localStorage.setItem(CREDIT_ITEMS_KEY, JSON.stringify(creditItems))

    cachedWalletState = { cards, msrItems, creditItems }
    return cachedWalletState
  } catch {
    cachedWalletState = {
      cards: INITIAL_DEMO_CARDS,
      msrItems: INITIAL_DEMO_MSR,
      creditItems: INITIAL_DEMO_CREDITS,
    }
    return cachedWalletState
  }
}

const SERVER_WALLET_SNAPSHOT: WalletState = {
  cards: INITIAL_DEMO_CARDS,
  msrItems: INITIAL_DEMO_MSR,
  creditItems: INITIAL_DEMO_CREDITS,
}

function getServerWalletSnapshot(): WalletState {
  return SERVER_WALLET_SNAPSHOT
}

function subscribeWallet(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function mutateWallet(updater: (prev: WalletState) => WalletState) {
  const current = getWalletSnapshot()
  const next = updater(current)
  cachedWalletState = next

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WALLET_CARDS_KEY, JSON.stringify(next.cards))
      localStorage.setItem(MSR_ITEMS_KEY, JSON.stringify(next.msrItems))
      localStorage.setItem(CREDIT_ITEMS_KEY, JSON.stringify(next.creditItems))
    } catch {}
  }

  emitWalletChange()
}

export function useWallet() {
  const state = React.useSyncExternalStore(
    subscribeWallet,
    getWalletSnapshot,
    getServerWalletSnapshot
  )

  const cards = state.cards
  const msrItems = state.msrItems
  const creditItems = state.creditItems

  // Calculated 5/24 status
  const fiveTwentyFour = React.useMemo(() => {
    return calculate524Status(cards, allCards)
  }, [cards])

  // Total summary metrics
  const metrics = React.useMemo<WalletSummaryMetrics>(() => {
    const totalAnnualFees = cards.reduce(
      (sum, c) => sum + (c.annualFee || 0),
      0
    )
    const totalCreditLimit = cards.reduce(
      (sum, c) => sum + (c.creditLimit || 0),
      0
    )

    const activeMSRCount = msrItems.filter(
      (m) => m.currentSpend < m.targetSpend
    ).length
    const totalTargetSpend = msrItems.reduce((sum, m) => sum + m.targetSpend, 0)
    const totalCurrentSpend = msrItems.reduce(
      (sum, m) => sum + m.currentSpend,
      0
    )

    const totalCreditValue = creditItems.reduce((sum, cr) => sum + cr.amount, 0)
    const redeemedCreditValue = creditItems
      .filter((cr) => cr.isRedeemed)
      .reduce((sum, cr) => sum + cr.amount, 0)

    return {
      totalAnnualFees,
      totalCreditLimit,
      fiveTwentyFour,
      activeMSRCount,
      totalTargetSpend,
      totalCurrentSpend,
      totalCreditValue,
      redeemedCreditValue,
    }
  }, [cards, fiveTwentyFour, msrItems, creditItems])

  // Add Card to Wallet
  const addCard = React.useCallback(
    (cardData: {
      cardSlug: string
      nickname?: string
      openedDate: string
      creditLimit?: number
      annualFee?: number
      notes?: string
      targetSpend?: number
      currentSpend?: number
      deadlineDate?: string
      welcomeBonus?: string
      trackMSR?: boolean
    }) => {
      const catalogCard = allCards.find((c) => c.id === cardData.cardSlug)
      const newCardId = `wallet-${cardData.cardSlug}-${Date.now().toString(36)}`

      const newCard: UserWalletCard = {
        id: newCardId,
        cardSlug: cardData.cardSlug,
        nickname: cardData.nickname?.trim() || undefined,
        openedDate: cardData.openedDate,
        creditLimit: cardData.creditLimit || undefined,
        annualFee:
          cardData.annualFee !== undefined
            ? cardData.annualFee
            : (catalogCard?.annualFee ?? 0),
        isCustom: false,
        notes: cardData.notes?.trim() || undefined,
      }

      let newMSR: MSRTrackerItem | null = null
      if (
        cardData.trackMSR &&
        cardData.targetSpend &&
        cardData.targetSpend > 0
      ) {
        newMSR = {
          id: `msr-${newCardId}`,
          userCardId: newCardId,
          cardName: catalogCard?.name || cardData.cardSlug,
          targetSpend: cardData.targetSpend,
          currentSpend: cardData.currentSpend || 0,
          deadlineDate:
            cardData.deadlineDate ||
            formatDateISO(
              new Date(
                new Date(cardData.openedDate).getTime() +
                  (catalogCard?.signupBonus.timeframeMonths || 3) *
                    30 *
                    24 *
                    60 *
                    60 *
                    1000
              )
            ),
          welcomeBonus:
            cardData.welcomeBonus ||
            (catalogCard
              ? `${catalogCard.signupBonus.amount} ${catalogCard.signupBonus.unit}`
              : "Welcome Bonus"),
        }
      }

      let newCredits: CreditRedemptionItem[] = []
      if (catalogCard?.credits && catalogCard.credits.length > 0) {
        newCredits = catalogCard.credits.map((cr, idx) => ({
          id: `credit-${newCardId}-${idx}`,
          userCardId: newCardId,
          cardName: catalogCard.name,
          creditName: cr.name,
          amount: cr.amount,
          frequency: cr.frequency,
          isRedeemed: false,
          resetDate:
            cr.frequency === "monthly"
              ? "Monthly on 1st"
              : cr.frequency === "semi-annual"
                ? "Every 6 months"
                : "Annual Anniversary",
        }))
      }

      mutateWallet((prev) => ({
        cards: [newCard, ...prev.cards],
        msrItems: newMSR ? [newMSR, ...prev.msrItems] : prev.msrItems,
        creditItems: [...newCredits, ...prev.creditItems],
      }))

      return newCard
    },
    []
  )

  // Update Card Details
  const updateCard = React.useCallback(
    (id: string, updates: Partial<UserWalletCard>) => {
      mutateWallet((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }))
    },
    []
  )

  // Remove Card & its associated trackers
  const removeCard = React.useCallback((id: string) => {
    mutateWallet((prev) => ({
      cards: prev.cards.filter((c) => c.id !== id),
      msrItems: prev.msrItems.filter((m) => m.userCardId !== id),
      creditItems: prev.creditItems.filter((cr) => cr.userCardId !== id),
    }))
  }, [])

  // MSR Spend update
  const updateMSRSpend = React.useCallback(
    (msrId: string, newSpend: number) => {
      mutateWallet((prev) => ({
        ...prev,
        msrItems: prev.msrItems.map((m) =>
          m.id === msrId ? { ...m, currentSpend: Math.max(0, newSpend) } : m
        ),
      }))
    },
    []
  )

  // Add spend increment to an MSR
  const addMSRSpendIncrement = React.useCallback(
    (msrId: string, increment: number) => {
      mutateWallet((prev) => ({
        ...prev,
        msrItems: prev.msrItems.map((m) =>
          m.id === msrId
            ? { ...m, currentSpend: Math.max(0, m.currentSpend + increment) }
            : m
        ),
      }))
    },
    []
  )

  // Add standalone MSR item
  const addMSRItem = React.useCallback((item: Omit<MSRTrackerItem, "id">) => {
    const newMSR: MSRTrackerItem = {
      ...item,
      id: `msr-custom-${Date.now().toString(36)}`,
    }
    mutateWallet((prev) => ({
      ...prev,
      msrItems: [newMSR, ...prev.msrItems],
    }))
  }, [])

  // Remove MSR item
  const removeMSRItem = React.useCallback((msrId: string) => {
    mutateWallet((prev) => ({
      ...prev,
      msrItems: prev.msrItems.filter((m) => m.id !== msrId),
    }))
  }, [])

  // Toggle Credit Redemption status
  const toggleCreditRedemption = React.useCallback((creditId: string) => {
    mutateWallet((prev) => ({
      ...prev,
      creditItems: prev.creditItems.map((cr) =>
        cr.id === creditId ? { ...cr, isRedeemed: !cr.isRedeemed } : cr
      ),
    }))
  }, [])

  // Reset all credit redemptions (e.g. at start of new year)
  const resetCreditRedemptions = React.useCallback(() => {
    mutateWallet((prev) => ({
      ...prev,
      creditItems: prev.creditItems.map((cr) => ({ ...cr, isRedeemed: false })),
    }))
  }, [])

  // Reset to default demo state
  const resetToDemo = React.useCallback(() => {
    mutateWallet(() => ({
      cards: INITIAL_DEMO_CARDS,
      msrItems: INITIAL_DEMO_MSR,
      creditItems: INITIAL_DEMO_CREDITS,
    }))
  }, [])

  // Clear all wallet data
  const clearAll = React.useCallback(() => {
    mutateWallet(() => ({
      cards: [],
      msrItems: [],
      creditItems: [],
    }))
  }, [])

  return {
    cards,
    msrItems,
    creditItems,
    metrics,
    fiveTwentyFour,
    allCatalogCards: allCards,
    addCard,
    updateCard,
    removeCard,
    updateMSRSpend,
    addMSRSpendIncrement,
    addMSRItem,
    removeMSRItem,
    toggleCreditRedemption,
    resetCreditRedemptions,
    resetToDemo,
    clearAll,
  }
}
