import { CreditCard } from "@/types/card"
import {
  UserWalletCard,
  RuleDetail,
  BankRuleGroup,
  IssuerRulesSummary,
} from "./types/wallet"

// Helper utilities for date math
function parseLocalDate(dateStr: string): Date {
  // Split YYYY-MM-DD to avoid timezone shifting
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateHuman(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(d: Date, months: number): Date {
  const result = new Date(d)
  result.setMonth(result.getMonth() + months)
  return result
}

function diffDays(future: Date, now: Date): number {
  const diffMs = future.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function diffMonths(future: Date, now: Date): number {
  const days = diffDays(future, now)
  return Math.max(0, Math.ceil(days / 30.44))
}

function getCardIssuer(card: UserWalletCard, catalogCards: CreditCard[]): string {
  const catalog = catalogCards.find((c) => c.id === card.cardSlug)
  if (catalog?.issuer) return catalog.issuer.toLowerCase()

  const slug = card.cardSlug.toLowerCase()
  if (slug.includes("chase")) return "chase"
  if (slug.includes("amex") || slug.includes("american express")) return "american express"
  if (slug.includes("capital-one") || slug.includes("venture") || slug.includes("savor")) return "capital one"
  if (slug.includes("citi")) return "citi"
  if (slug.includes("wells-fargo") || slug.includes("autograph") || slug.includes("active-cash")) return "wells fargo"
  if (slug.includes("boa") || slug.includes("bank of america")) return "bank of america"
  return "other"
}

function getCardName(card: UserWalletCard, catalogCards: CreditCard[]): string {
  if (card.nickname) return card.nickname
  const catalog = catalogCards.find((c) => c.id === card.cardSlug)
  return catalog?.name || card.cardSlug
}

export function calculateIssuerRules(
  cards: UserWalletCard[],
  catalogCards: CreditCard[],
  now: Date = new Date()
): IssuerRulesSummary {
  const normalizedCards = cards
    .filter((c) => Boolean(c.openedDate))
    .map((c) => ({
      ...c,
      openedObj: parseLocalDate(c.openedDate),
      issuer: getCardIssuer(c, catalogCards),
      name: getCardName(c, catalogCards),
    }))
    .sort((a, b) => b.openedObj.getTime() - a.openedObj.getTime()) // Newest first

  // --------------------------------------------------------------------------
  // 1. CHASE RULES
  // --------------------------------------------------------------------------
  const chaseCutoff24 = addMonths(now, -24)
  const cardsIn24Mo = normalizedCards.filter(
    (c) => c.openedObj >= chaseCutoff24
  )

  // In Chase practice, drop-off occurs on the 1st of the 25th month following opening
  const chaseDropOffEntries = cardsIn24Mo.map((c) => {
    const dropOff = new Date(c.openedObj.getFullYear() + 2, c.openedObj.getMonth() + 1, 1)
    return {
      card: c,
      dropOff,
      daysRemaining: diffDays(dropOff, now),
    }
  }).sort((a, b) => a.dropOff.getTime() - b.dropOff.getTime())

  const chase524Count = cardsIn24Mo.length
  const chase524SlotsRemaining = Math.max(0, 5 - chase524Count)
  const chase524UnderLimit = chase524Count < 5
  const nextChaseDropOff = chaseDropOffEntries[0] || null

  const chase524Rule: RuleDetail = {
    id: "chase-524",
    name: "Chase 5/24 Rule",
    description: "Automatic rejection if you have opened 5 or more personal cards across ANY bank in the trailing 24 months.",
    status: chase524Count >= 5 ? "locked" : chase524Count === 4 ? "warning" : "eligible",
    currentCount: chase524Count,
    maxLimit: 5,
    slotsRemaining: chase524SlotsRemaining,
    isUnderLimit: chase524UnderLimit,
    cooldownActive: chase524Count >= 5,
    daysRemaining: nextChaseDropOff?.daysRemaining,
    monthsRemaining: nextChaseDropOff ? diffMonths(nextChaseDropOff.dropOff, now) : undefined,
    unlockDate: nextChaseDropOff ? formatDateISO(nextChaseDropOff.dropOff) : null,
    unlockFormatted: nextChaseDropOff ? formatDateHuman(nextChaseDropOff.dropOff) : null,
    progressPercent: Math.min(100, Math.round((chase524Count / 5) * 100)),
    contributingCards: cardsIn24Mo.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation:
      chase524Count >= 5
        ? "You have opened 5 or more personal cards in the last 24 months. Focus on business cards or non-Chase issuers until your next drop-off date."
        : chase524Count === 4
        ? "You have opened 4 personal cards in 24 months (only 1 Chase slot remaining). Prioritize an impactful Chase card next."
        : `You have opened ${chase524Count} personal cards in 24 months (${chase524SlotsRemaining} Chase slots available). Prioritize Chase cards now before opening accounts with other banks.`,
  }

  // Chase Sapphire 48-Month Bonus Cooldown
  const sapphireCards = normalizedCards.filter(
    (c) =>
      c.cardSlug.includes("sapphire") ||
      c.name.toLowerCase().includes("sapphire")
  )
  const mostRecentSapphire = sapphireCards[0] || null

  let sapphireRule: RuleDetail
  if (mostRecentSapphire) {
    // Smart default: bonus earned 3 months after open date, or exact bonusEarnedDate
    const bonusEarnedBase = mostRecentSapphire.bonusEarnedDate
      ? parseLocalDate(mostRecentSapphire.bonusEarnedDate)
      : addMonths(mostRecentSapphire.openedObj, 3)

    const sapphireUnlock = addMonths(bonusEarnedBase, 48)
    const isSapphireCooldown = sapphireUnlock > now
    const daysLeft = diffDays(sapphireUnlock, now)
    const monthsLeft = diffMonths(sapphireUnlock, now)
    const elapsedDays = Math.max(0, 1460 - daysLeft) // ~48 mo * 30.4 days
    const progress = Math.min(100, Math.round((elapsedDays / 1460) * 100))

    sapphireRule = {
      id: "chase-sapphire-48",
      name: "Chase Sapphire 48-Month Bonus Cooldown",
      description: "You cannot receive a welcome bonus on any Sapphire card if you earned a Sapphire bonus within the past 48 months.",
      status: isSapphireCooldown ? "warning" : "eligible",
      cooldownActive: isSapphireCooldown,
      isUnderLimit: !isSapphireCooldown,
      daysRemaining: isSapphireCooldown ? daysLeft : 0,
      monthsRemaining: isSapphireCooldown ? monthsLeft : 0,
      unlockDate: formatDateISO(sapphireUnlock),
      unlockFormatted: formatDateHuman(sapphireUnlock),
      progressPercent: progress,
      contributingCards: [
        {
          cardName: mostRecentSapphire.name,
          openedDate: mostRecentSapphire.openedDate,
          bonusDate: formatDateISO(bonusEarnedBase),
        },
      ],
      recommendation: isSapphireCooldown
        ? `In cooldown for ${monthsLeft} more months (until ${formatDateHuman(sapphireUnlock)}). Hold off on applying for a Sapphire Preferred or Reserve welcome bonus.`
        : "48-month bonus cooldown has elapsed! You are eligible for a new Sapphire bonus (remember: you may only hold 1 Sapphire card at a time).",
    }
  } else {
    sapphireRule = {
      id: "chase-sapphire-48",
      name: "Chase Sapphire 48-Month Bonus Cooldown",
      description: "Eligible for Chase Sapphire Preferred or Reserve 60k-85k welcome offers (no active Sapphire bonus history).",
      status: "eligible",
      cooldownActive: false,
      isUnderLimit: true,
      progressPercent: 100,
      contributingCards: [],
      recommendation: "Eligible! You have no active Sapphire cards in your portfolio and are clear to earn a Sapphire welcome offer.",
    }
  }

  // Chase 2/30 Rule: Max 2 Chase cards in trailing 30 days
  const chase30dCutoff = addDays(now, -30)
  const chaseCards30d = normalizedCards.filter(
    (c) => c.issuer.includes("chase") && c.openedObj >= chase30dCutoff
  )
  const chase230Rule: RuleDetail = {
    id: "chase-230",
    name: "Chase 2/30 Velocity Limit",
    description: "Maximum of 2 Chase card approvals across any 30-day rolling window.",
    status: chaseCards30d.length >= 2 ? "locked" : chaseCards30d.length === 1 ? "warning" : "eligible",
    currentCount: chaseCards30d.length,
    maxLimit: 2,
    slotsRemaining: Math.max(0, 2 - chaseCards30d.length),
    isUnderLimit: chaseCards30d.length < 2,
    cooldownActive: chaseCards30d.length >= 2,
    progressPercent: Math.min(100, (chaseCards30d.length / 2) * 100),
    contributingCards: chaseCards30d.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation:
      chaseCards30d.length >= 2
        ? "Locked: 2 Chase cards opened in the last 30 days. Wait for the 30-day window to lapse before applying for another Chase card."
        : `${2 - chaseCards30d.length} of 2 Chase applications available this month.`,
  }

  const chaseGroup: BankRuleGroup = {
    issuerId: "chase",
    issuerName: "Chase",
    logoShort: "CH",
    logoStyle: {
      border: "border-blue-500/30 hover:border-blue-500/50",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      text: "text-blue-400",
    },
    overallStatus: chase524Count >= 5 || chaseCards30d.length >= 2 ? "locked" : sapphireRule.cooldownActive ? "warning" : "eligible",
    statusMessage:
      chase524Count >= 5
        ? "Over 5/24 Limit"
        : sapphireRule.cooldownActive
        ? "1 Cooldown Active"
        : "Ready to Apply",
    activeCooldownsCount: (chase524Count >= 5 ? 1 : 0) + (sapphireRule.cooldownActive ? 1 : 0) + (chaseCards30d.length >= 2 ? 1 : 0),
    rules: [chase524Rule, sapphireRule, chase230Rule],
  }

  // --------------------------------------------------------------------------
  // 2. BANK OF AMERICA RULES
  // --------------------------------------------------------------------------
  const boaCards = normalizedCards.filter((c) => c.issuer.includes("bank of america"))

  // BoA 2-in-90 Days Rule
  const boa90dCutoff = addDays(now, -90)
  const boaCards90d = boaCards.filter((c) => c.openedObj >= boa90dCutoff)
  const mostRecentBoa = boaCards[0] || null

  let boa90dRule: RuleDetail
  if (mostRecentBoa) {
    const unlock90 = addDays(mostRecentBoa.openedObj, 90)
    const isCooldown = unlock90 > now
    const daysLeft = diffDays(unlock90, now)
    const elapsed = Math.max(0, 90 - daysLeft)
    const progress = Math.min(100, Math.round((elapsed / 90) * 100))

    boa90dRule = {
      id: "boa-90d",
      name: "Bank of America 2-in-90 Days Rule",
      description: "Maximum of 2 personal Bank of America cards approved in any rolling 90-day window.",
      status: boaCards90d.length >= 2 ? "locked" : isCooldown ? "warning" : "eligible",
      currentCount: boaCards90d.length,
      maxLimit: 2,
      slotsRemaining: Math.max(0, 2 - boaCards90d.length),
      isUnderLimit: boaCards90d.length < 2,
      cooldownActive: isCooldown,
      daysRemaining: isCooldown ? daysLeft : 0,
      unlockDate: formatDateISO(unlock90),
      unlockFormatted: formatDateHuman(unlock90),
      progressPercent: progress,
      contributingCards: [
        {
          cardName: mostRecentBoa.name,
          openedDate: mostRecentBoa.openedDate,
        },
      ],
      recommendation: isCooldown
        ? `Wait ${daysLeft} days (until ${formatDateHuman(unlock90)}) before submitting your next Bank of America application.`
        : "Clear: No recent Bank of America applications within 90 days. Safe to apply.",
    }
  } else {
    boa90dRule = {
      id: "boa-90d",
      name: "Bank of America 2-in-90 Days Rule",
      description: "Maximum of 2 personal Bank of America cards approved in any rolling 90-day window.",
      status: "eligible",
      currentCount: 0,
      maxLimit: 2,
      slotsRemaining: 2,
      isUnderLimit: true,
      cooldownActive: false,
      progressPercent: 100,
      contributingCards: [],
      recommendation: "Clear: No Bank of America cards opened in the last 90 days. Safe to apply.",
    }
  }

  // BoA 2/3/4 Rule: Max 2 in 2mo (60d), 3 in 12mo (365d), 4 in 24mo (730d)
  const boa2moCount = boaCards.filter((c) => c.openedObj >= addDays(now, -60)).length
  const boa12moCount = boaCards.filter((c) => c.openedObj >= addDays(now, -365)).length
  const boa24moCount = boaCards.filter((c) => c.openedObj >= addDays(now, -730)).length

  const isBoa234Locked = boa2moCount >= 2 || boa12moCount >= 3 || boa24moCount >= 4
  const boa234Rule: RuleDetail = {
    id: "boa-234",
    name: "Bank of America 2/3/4 Velocity Rule",
    description: "Limits approvals to max 2 cards per 2 months, 3 cards per 12 months, and 4 cards per 24 months.",
    status: isBoa234Locked ? "locked" : boa2moCount >= 1 ? "warning" : "eligible",
    isUnderLimit: !isBoa234Locked,
    cooldownActive: isBoa234Locked,
    progressPercent: Math.min(100, Math.round((boa24moCount / 4) * 100)),
    contributingCards: boaCards.slice(0, 4).map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation: isBoa234Locked
      ? `Over limit: ${boa2moCount}/2 in 2mo, ${boa12moCount}/3 in 12mo, ${boa24moCount}/4 in 24mo. Automatic denial if applying now.`
      : `Clear: ${boa2moCount}/2 in 2mo, ${boa12moCount}/3 in 12mo, ${boa24moCount}/4 in 24mo. Within velocity thresholds.`,
  }

  const boaGroup: BankRuleGroup = {
    issuerId: "boa",
    issuerName: "Bank of America",
    logoShort: "BOA",
    logoStyle: {
      border: "border-red-500/30 hover:border-red-500/50",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      text: "text-red-400",
    },
    overallStatus: isBoa234Locked ? "locked" : boa90dRule.cooldownActive ? "warning" : "eligible",
    statusMessage: isBoa234Locked ? "Velocity Limit Exceeded" : boa90dRule.cooldownActive ? "1 Active Cooldown" : "Ready to Apply",
    activeCooldownsCount: (boa90dRule.cooldownActive ? 1 : 0) + (isBoa234Locked ? 1 : 0),
    rules: [boa90dRule, boa234Rule],
  }

  // --------------------------------------------------------------------------
  // 3. WELLS FARGO RULES
  // --------------------------------------------------------------------------
  const wfCards = normalizedCards.filter((c) => c.issuer.includes("wells fargo"))
  const mostRecentWf = wfCards[0] || null

  let wfBonusRule: RuleDetail
  if (mostRecentWf) {
    const bonusBase = mostRecentWf.bonusEarnedDate
      ? parseLocalDate(mostRecentWf.bonusEarnedDate)
      : addMonths(mostRecentWf.openedObj, 3)

    const wfUnlock = addMonths(bonusBase, 15)
    const isWfBonusCooldown = wfUnlock > now
    const daysLeft = diffDays(wfUnlock, now)
    const monthsLeft = diffMonths(wfUnlock, now)
    const elapsedDays = Math.max(0, 456 - daysLeft) // 15 mo * 30.4 days
    const progress = Math.min(100, Math.round((elapsedDays / 456) * 100))

    wfBonusRule = {
      id: "wf-15mo-bonus",
      name: "Wells Fargo 15-Month Bonus Cooldown",
      description: "You may not be eligible for a new welcome bonus if you received one on another Wells Fargo card within the past 15 months.",
      status: isWfBonusCooldown ? "warning" : "eligible",
      cooldownActive: isWfBonusCooldown,
      isUnderLimit: !isWfBonusCooldown,
      daysRemaining: isWfBonusCooldown ? daysLeft : 0,
      monthsRemaining: isWfBonusCooldown ? monthsLeft : 0,
      unlockDate: formatDateISO(wfUnlock),
      unlockFormatted: formatDateHuman(wfUnlock),
      progressPercent: progress,
      contributingCards: [
        {
          cardName: mostRecentWf.name,
          openedDate: mostRecentWf.openedDate,
          bonusDate: formatDateISO(bonusBase),
        },
      ],
      recommendation: isWfBonusCooldown
        ? `You can be approved for a Wells Fargo card now, but your welcome bonus is locked for ${monthsLeft} more months (until ${formatDateHuman(wfUnlock)}).`
        : "Eligible! 15-month bonus cooldown has elapsed. Full welcome offer available.",
    }
  } else {
    wfBonusRule = {
      id: "wf-15mo-bonus",
      name: "Wells Fargo 15-Month Bonus Cooldown",
      description: "Eligible for Wells Fargo Autograph or Active Cash welcome bonuses (no recent bonuses).",
      status: "eligible",
      cooldownActive: false,
      isUnderLimit: true,
      progressPercent: 100,
      contributingCards: [],
      recommendation: "Eligible! No recent Wells Fargo cards held. Safe to apply for full welcome offers.",
    }
  }

  // Wells Fargo 6-Month Velocity
  let wf6moVelocityRule: RuleDetail
  if (mostRecentWf) {
    const wf6moUnlock = addMonths(mostRecentWf.openedObj, 6)
    const isWfVelCooldown = wf6moUnlock > now
    const daysLeft = diffDays(wf6moUnlock, now)

    wf6moVelocityRule = {
      id: "wf-6mo-velocity",
      name: "Wells Fargo 6-Month Velocity Rule",
      description: "Limit of 1 Wells Fargo consumer card approval every 6 months.",
      status: isWfVelCooldown ? "warning" : "eligible",
      cooldownActive: isWfVelCooldown,
      isUnderLimit: !isWfVelCooldown,
      daysRemaining: isWfVelCooldown ? daysLeft : 0,
      unlockDate: formatDateISO(wf6moUnlock),
      unlockFormatted: formatDateHuman(wf6moUnlock),
      progressPercent: Math.min(100, Math.round(((180 - daysLeft) / 180) * 100)),
      contributingCards: [
        {
          cardName: mostRecentWf.name,
          openedDate: mostRecentWf.openedDate,
        },
      ],
      recommendation: isWfVelCooldown
        ? `Hold off ${daysLeft} more days before submitting a new Wells Fargo application.`
        : "Clear: 6 months have elapsed since your last Wells Fargo account opening.",
    }
  } else {
    wf6moVelocityRule = {
      id: "wf-6mo-velocity",
      name: "Wells Fargo 6-Month Velocity Rule",
      description: "Limit of 1 Wells Fargo consumer card approval every 6 months.",
      status: "eligible",
      cooldownActive: false,
      isUnderLimit: true,
      progressPercent: 100,
      contributingCards: [],
      recommendation: "Clear: No recent Wells Fargo applications. Safe to apply.",
    }
  }

  const wfGroup: BankRuleGroup = {
    issuerId: "wells-fargo",
    issuerName: "Wells Fargo",
    logoShort: "WF",
    logoStyle: {
      border: "border-yellow-500/30 hover:border-yellow-500/50",
      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      text: "text-yellow-400",
    },
    overallStatus: wf6moVelocityRule.cooldownActive ? "warning" : wfBonusRule.cooldownActive ? "warning" : "eligible",
    statusMessage: wfBonusRule.cooldownActive ? "1 Bonus Cooldown" : "Ready to Apply",
    activeCooldownsCount: (wfBonusRule.cooldownActive ? 1 : 0) + (wf6moVelocityRule.cooldownActive ? 1 : 0),
    rules: [wfBonusRule, wf6moVelocityRule],
  }

  // --------------------------------------------------------------------------
  // 4. AMERICAN EXPRESS RULES
  // --------------------------------------------------------------------------
  const amexCards = normalizedCards.filter((c) => c.issuer.includes("american express"))
  // Amex Gold & Platinum are charge cards with no preset spending limit, not subject to 5-credit-card limit
  const isChargeCard = (slug: string) => slug.includes("gold") || slug.includes("platinum") || slug.includes("green")
  const amexCreditCards = amexCards.filter((c) => !isChargeCard(c.cardSlug))

  const amex5CardRule: RuleDetail = {
    id: "amex-5card-limit",
    name: "Amex 5 Credit Card Limit",
    description: "Maximum of 5 consumer and business revolving credit cards held simultaneously (charge cards like Gold and Platinum are exempt).",
    status: amexCreditCards.length >= 5 ? "locked" : amexCreditCards.length === 4 ? "warning" : "eligible",
    currentCount: amexCreditCards.length,
    maxLimit: 5,
    slotsRemaining: Math.max(0, 5 - amexCreditCards.length),
    isUnderLimit: amexCreditCards.length < 5,
    cooldownActive: amexCreditCards.length >= 5,
    progressPercent: Math.min(100, (amexCreditCards.length / 5) * 100),
    contributingCards: amexCreditCards.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation:
      amexCreditCards.length >= 5
        ? "At the 5-card maximum limit for Amex credit cards. You must close a card to be approved for a new one."
        : `${5 - amexCreditCards.length} of 5 Amex credit card slots available. Safe to apply for Blue Cash Preferred, Delta, or Hilton cards.`,
  }

  // Amex 2/90 Credit Card Rule: Max 2 credit cards in 90 days
  const amex90dCutoff = addDays(now, -90)
  const amexCreditCards90d = amexCreditCards.filter((c) => c.openedObj >= amex90dCutoff)
  const amex290Rule: RuleDetail = {
    id: "amex-290",
    name: "Amex 2/90 Credit Card Rule",
    description: "Maximum of 2 Amex revolving credit cards approved in any rolling 90-day window.",
    status: amexCreditCards90d.length >= 2 ? "locked" : "eligible",
    currentCount: amexCreditCards90d.length,
    maxLimit: 2,
    slotsRemaining: Math.max(0, 2 - amexCreditCards90d.length),
    isUnderLimit: amexCreditCards90d.length < 2,
    cooldownActive: amexCreditCards90d.length >= 2,
    progressPercent: Math.min(100, (amexCreditCards90d.length / 2) * 100),
    contributingCards: amexCreditCards90d.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation:
      amexCreditCards90d.length >= 2
        ? "Locked: 2 Amex credit cards opened in trailing 90 days. Wait for the 90-day window to lapse."
        : "Clear: Under 2 Amex credit cards in the past 90 days. Safe to apply.",
  }

  const amexGroup: BankRuleGroup = {
    issuerId: "amex",
    issuerName: "American Express",
    logoShort: "AX",
    logoStyle: {
      border: "border-amber-500/30 hover:border-amber-500/50",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      text: "text-amber-400",
    },
    overallStatus: amex5CardRule.cooldownActive || amex290Rule.cooldownActive ? "locked" : "eligible",
    statusMessage: amex5CardRule.cooldownActive ? "5-Card Limit Reached" : "Ready to Apply",
    activeCooldownsCount: (amex5CardRule.cooldownActive ? 1 : 0) + (amex290Rule.cooldownActive ? 1 : 0),
    rules: [amex5CardRule, amex290Rule],
  }

  // --------------------------------------------------------------------------
  // 5. CAPITAL ONE RULES
  // --------------------------------------------------------------------------
  const capOneCards = normalizedCards.filter((c) => c.issuer.includes("capital one"))
  const mostRecentCapOne = capOneCards[0] || null

  let capOne16Rule: RuleDetail
  if (mostRecentCapOne) {
    const capOneUnlock = addMonths(mostRecentCapOne.openedObj, 6)
    const isCapOneCooldown = capOneUnlock > now
    const daysLeft = diffDays(capOneUnlock, now)

    capOne16Rule = {
      id: "capone-16",
      name: "Capital One 1/6 Velocity Rule",
      description: "Capital One strictly enforces a maximum of 1 card approval (personal or business) every 6 months.",
      status: isCapOneCooldown ? "warning" : "eligible",
      cooldownActive: isCapOneCooldown,
      isUnderLimit: !isCapOneCooldown,
      daysRemaining: isCapOneCooldown ? daysLeft : 0,
      unlockDate: formatDateISO(capOneUnlock),
      unlockFormatted: formatDateHuman(capOneUnlock),
      progressPercent: Math.min(100, Math.round(((180 - daysLeft) / 180) * 100)),
      contributingCards: [
        {
          cardName: mostRecentCapOne.name,
          openedDate: mostRecentCapOne.openedDate,
        },
      ],
      recommendation: isCapOneCooldown
        ? `In cooldown for ${daysLeft} more days (until ${formatDateHuman(capOneUnlock)}). Capital One will deny applications submitted before this date.`
        : "Clear: 6 months have passed since your last Capital One account opening. Safe to apply.",
    }
  } else {
    capOne16Rule = {
      id: "capone-16",
      name: "Capital One 1/6 Velocity Rule",
      description: "Capital One strictly enforces a maximum of 1 card approval every 6 months.",
      status: "eligible",
      cooldownActive: false,
      isUnderLimit: true,
      progressPercent: 100,
      contributingCards: [],
      recommendation: "Clear: No recent Capital One card openings. Safe to apply.",
    }
  }

  const capOne2CardRule: RuleDetail = {
    id: "capone-2card",
    name: "Capital One 2 Personal Card Limit",
    description: "Capital One limits consumer cardholders to a maximum of 2 personal Capital One-branded credit cards held simultaneously.",
    status: capOneCards.length >= 2 ? "locked" : "eligible",
    currentCount: capOneCards.length,
    maxLimit: 2,
    slotsRemaining: Math.max(0, 2 - capOneCards.length),
    isUnderLimit: capOneCards.length < 2,
    cooldownActive: capOneCards.length >= 2,
    progressPercent: Math.min(100, (capOneCards.length / 2) * 100),
    contributingCards: capOneCards.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation:
      capOneCards.length >= 2
        ? "At the 2 personal card maximum limit for Capital One. Consider Capital One Spark business cards instead."
        : `You hold ${capOneCards.length} of 2 allowable personal Capital One cards (1 slot remaining). Safe to apply.`,
  }

  const capOneGroup: BankRuleGroup = {
    issuerId: "capital-one",
    issuerName: "Capital One",
    logoShort: "CO",
    logoStyle: {
      border: "border-red-500/30 hover:border-red-500/50",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      text: "text-red-400",
    },
    overallStatus: capOne16Rule.cooldownActive ? "warning" : capOne2CardRule.cooldownActive ? "locked" : "eligible",
    statusMessage: capOne16Rule.cooldownActive ? "1 Active Cooldown" : "Ready to Apply",
    activeCooldownsCount: (capOne16Rule.cooldownActive ? 1 : 0) + (capOne2CardRule.cooldownActive ? 1 : 0),
    rules: [capOne16Rule, capOne2CardRule],
  }

  // --------------------------------------------------------------------------
  // 6. CITI RULES
  // --------------------------------------------------------------------------
  const citiCards = normalizedCards.filter((c) => c.issuer.includes("citi"))
  const citi8dCutoff = addDays(now, -8)
  const citi65dCutoff = addDays(now, -65)

  const citiCards8d = citiCards.filter((c) => c.openedObj >= citi8dCutoff)
  const citiCards65d = citiCards.filter((c) => c.openedObj >= citi65dCutoff)

  const isCiti865Locked = citiCards8d.length >= 1 || citiCards65d.length >= 2
  const citi865Rule: RuleDetail = {
    id: "citi-865",
    name: "Citi 8/65 Velocity Rule",
    description: "Maximum of 1 Citi card approval in any rolling 8-day window, and maximum of 2 cards in any rolling 65-day window.",
    status: isCiti865Locked ? "locked" : "eligible",
    isUnderLimit: !isCiti865Locked,
    cooldownActive: isCiti865Locked,
    progressPercent: isCiti865Locked ? 100 : 0,
    contributingCards: citiCards65d.map((c) => ({
      cardName: c.name,
      openedDate: c.openedDate,
    })),
    recommendation: isCiti865Locked
      ? "Locked: You have applied for a Citi card recently. Ensure at least 8 days pass after card 1, and 65 days after card 2."
      : "Clear: No recent Citi card inquiries. Safe to apply for Citi Strata Premier or Double Cash.",
  }

  const citiGroup: BankRuleGroup = {
    issuerId: "citi",
    issuerName: "Citi",
    logoShort: "CI",
    logoStyle: {
      border: "border-sky-500/30 hover:border-sky-500/50",
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      text: "text-sky-400",
    },
    overallStatus: isCiti865Locked ? "locked" : "eligible",
    statusMessage: isCiti865Locked ? "Velocity Cooldown" : "Ready to Apply",
    activeCooldownsCount: isCiti865Locked ? 1 : 0,
    rules: [citi865Rule],
  }

  // --------------------------------------------------------------------------
  // AGGREGATION & SUMMARY
  // --------------------------------------------------------------------------
  const banks: BankRuleGroup[] = [
    chaseGroup,
    boaGroup,
    wfGroup,
    amexGroup,
    capOneGroup,
    citiGroup,
  ]

  const totalActiveCooldowns = banks.reduce(
    (sum, b) => sum + b.activeCooldownsCount,
    0
  )

  const readyToApplyBankCount = banks.filter(
    (b) => b.overallStatus === "eligible"
  ).length

  // Find next upcoming unlock date across all active cooldowns
  const allUnlockDates = banks
    .flatMap((b) => b.rules)
    .filter((r) => r.cooldownActive && Boolean(r.unlockDate))
    .map((r) => ({
      date: r.unlockDate!,
      formatted: r.unlockFormatted || r.unlockDate!,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nextOverallUnlockDate = allUnlockDates[0]?.date || null
  const nextOverallUnlockFormatted = allUnlockDates[0]?.formatted || null

  return {
    banks,
    totalActiveCooldowns,
    chase524: chase524Rule,
    readyToApplyBankCount,
    nextOverallUnlockDate,
    nextOverallUnlockFormatted,
  }
}
