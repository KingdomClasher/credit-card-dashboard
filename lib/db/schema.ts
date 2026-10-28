import { relations } from "drizzle-orm"
import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"

/**
 * Core users table populated via Clerk webhooks
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_clerk_id_idx").on(table.clerkId)]
)

/**
 * User Profile containing persona and preferences
 */
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creditScoreRange: text("credit_score_range"),
    monthlySpendBudget: numeric("monthly_spend_budget", {
      precision: 12,
      scale: 2,
    }),
    persona: text("persona"),
  },
  (table) => [index("user_profiles_user_id_idx").on(table.userId)]
)

/**
 * User Cards representing personal wallet inventory
 */
export const userCards = pgTable(
  "user_cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardSlug: text("card_slug").notNull(), // Matches cards.json id
    nickname: text("nickname"),
    openedDate: timestamp("opened_date", { withTimezone: true }),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }),
    annualFee: numeric("annual_fee", { precision: 12, scale: 2 }),
    isCustom: boolean("is_custom").default(false).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_cards_user_id_idx").on(table.userId),
    index("user_cards_card_slug_idx").on(table.cardSlug),
  ]
)

/**
 * Minimum Spend Requirement (MSR) / Welcome Bonus Tracker
 */
export const msrCampaigns = pgTable(
  "msr_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userCardId: uuid("user_card_id")
      .notNull()
      .references(() => userCards.id, { onDelete: "cascade" }),
    targetSpend: numeric("target_spend", { precision: 12, scale: 2 }).notNull(),
    currentSpend: numeric("current_spend", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    deadlineDate: timestamp("deadline_date", { withTimezone: true }).notNull(),
    status: text("status").default("active").notNull(), // active, completed, expired
  },
  (table) => [index("msr_campaigns_user_card_id_idx").on(table.userCardId)]
)

/**
 * Statement Credit Redemptions tracker
 */
export const creditRedemptions = pgTable(
  "credit_redemptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userCardId: uuid("user_card_id")
      .notNull()
      .references(() => userCards.id, { onDelete: "cascade" }),
    creditName: text("credit_name").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    redemptionDate: timestamp("redemption_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    notes: text("notes"),
  },
  (table) => [index("credit_redemptions_user_card_id_idx").on(table.userCardId)]
)

// Drizzle Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  cards: many(userCards),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const userCardsRelations = relations(userCards, ({ one, many }) => ({
  user: one(users, {
    fields: [userCards.userId],
    references: [users.id],
  }),
  msrCampaigns: many(msrCampaigns),
  creditRedemptions: many(creditRedemptions),
}))

export const msrCampaignsRelations = relations(msrCampaigns, ({ one }) => ({
  userCard: one(userCards, {
    fields: [msrCampaigns.userCardId],
    references: [userCards.id],
  }),
}))

export const creditRedemptionsRelations = relations(
  creditRedemptions,
  ({ one }) => ({
    userCard: one(userCards, {
      fields: [creditRedemptions.userCardId],
      references: [userCards.id],
    }),
  })
)

// Inferred TypeScript Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert

export type UserCard = typeof userCards.$inferSelect
export type NewUserCard = typeof userCards.$inferInsert

export type MSRCampaign = typeof msrCampaigns.$inferSelect
export type NewMSRCampaign = typeof msrCampaigns.$inferInsert

export type CreditRedemption = typeof creditRedemptions.$inferSelect
export type NewCreditRedemption = typeof creditRedemptions.$inferInsert
