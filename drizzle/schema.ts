import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  longtext
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with SaaS-specific fields for AI Viral Creation.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  mobile: varchar("mobile", { length: 20 }),
  avatar_url: text("avatar_url"),
  password_hash: text("password_hash"),
  google_id: varchar("google_id", { length: 255 }).unique(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  is_verified: boolean("is_verified").default(false),
  age_verified: boolean("age_verified").default(false),
  is_active: boolean("is_active").default(true),
  referred_by: varchar("referred_by", { length: 64 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credits system - tracks user credit balance
 */
export const credits = mysqlTable("credits", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull().unique(),
  balance: int("balance").default(10).notNull(),
  total_purchased: int("total_purchased").default(0),
  total_used: int("total_used").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = typeof credits.$inferInsert;

/**
 * Transactions - tracks all credit purchases and adjustments
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  type: mysqlEnum("type", ["PURCHASE", "REFUND", "BONUS", "AFFILIATE_BONUS"]).notNull(),
  credits_amount: int("credits_amount").notNull(),
  amount_inr: decimal("amount_inr", { precision: 10, scale: 2 }),
  razorpay_order_id: varchar("razorpay_order_id", { length: 255 }),
  razorpay_payment_id: varchar("razorpay_payment_id", { length: 255 }),
  status: mysqlEnum("status", ["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).default("PENDING"),
  package_name: varchar("package_name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Generations - tracks all AI-generated content
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  type: mysqlEnum("type", ["IMAGE", "VIDEO", "STORY", "AVATAR"]).notNull(),
  prompt: longtext("prompt").notNull(),
  output_url: text("output_url"),
  thumbnail_url: text("thumbnail_url"),
  is_watermarked: boolean("is_watermarked").default(true),
  quality: mysqlEnum("quality", ["standard", "hd"]).default("standard"),
  credits_used: int("credits_used").notNull(),
  status: mysqlEnum("status", ["PROCESSING", "COMPLETED", "FAILED"]).default("PROCESSING"),
  metadata: json("metadata"),
  is_flagged: boolean("is_flagged").default(false),
  flag_reason: text("flag_reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * Subscriptions - tracks user subscription plans
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull().unique(),
  plan: mysqlEnum("plan", ["FREE", "STARTER", "PRO", "BUSINESS"]).default("FREE"),
  started_at: timestamp("started_at").defaultNow(),
  expires_at: timestamp("expires_at"),
  is_active: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Affiliates - tracks affiliate program participation
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull().unique(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  total_referrals: int("total_referrals").default(0),
  total_earnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0"),
  pending_payout: decimal("pending_payout", { precision: 12, scale: 2 }).default("0"),
  paid_out: decimal("paid_out", { precision: 12, scale: 2 }).default("0"),
  is_active: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Affiliate Referrals - tracks individual referrals
 */
export const affiliate_referrals = mysqlTable("affiliate_referrals", {
  id: int("id").autoincrement().primaryKey(),
  affiliate_id: int("affiliate_id").notNull(),
  referred_user_id: int("referred_user_id").notNull(),
  purchase_amount: decimal("purchase_amount", { precision: 12, scale: 2 }).notNull(),
  commission_inr: decimal("commission_inr", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "PAID"]).default("PENDING"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateReferral = typeof affiliate_referrals.$inferSelect;
export type InsertAffiliateReferral = typeof affiliate_referrals.$inferInsert;

/**
 * User API Keys - stores encrypted API keys for custom providers
 */
export const user_api_keys = mysqlTable("user_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  key_hash: text("key_hash").notNull(),
  label: varchar("label", { length: 255 }),
  is_active: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserApiKey = typeof user_api_keys.$inferSelect;
export type InsertUserApiKey = typeof user_api_keys.$inferInsert;

/**
 * Admin Config - platform-level configuration
 */
export const admin_config = mysqlTable("admin_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: longtext("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminConfig = typeof admin_config.$inferSelect;
export type InsertAdminConfig = typeof admin_config.$inferInsert;

/**
 * Articles - blog posts and SEO content
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: longtext("content").notNull(),
  excerpt: text("excerpt"),
  cover_image: text("cover_image"),
  is_published: boolean("is_published").default(false),
  seo_title: varchar("seo_title", { length: 255 }),
  seo_desc: text("seo_desc"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Policies - legal documents
 */
export const policies = mysqlTable("policies", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 64 }).notNull().unique(),
  content: longtext("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;
