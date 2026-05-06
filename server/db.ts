import { eq, and, desc, sql, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  credits, 
  transactions, 
  generations, 
  subscriptions,
  affiliates,
  affiliate_referrals,
  articles,
  policies,
  admin_config,
  user_api_keys,
  user_violations,
  notFoundTracking,
  InsertNotFoundTracking
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "mobile", "avatar_url", "password_hash", "google_id", "referred_by"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Credits functions
export async function getOrCreateCredits(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  let credit = await db.select().from(credits).where(eq(credits.user_id, userId)).limit(1);
  
  if (credit.length === 0) {
    await db.insert(credits).values({ user_id: userId, balance: 10 });
    credit = await db.select().from(credits).where(eq(credits.user_id, userId)).limit(1);
  }
  
  return credit[0];
}

export async function updateCredits(userId: number, amount: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  const credit = await getOrCreateCredits(userId);
  if (!credit) return undefined;

  const newBalance = Math.max(0, credit.balance + amount);
  const totalUsed = credit.total_used ?? 0;
  const totalPurchased = credit.total_purchased ?? 0;
  
  await db.update(credits)
    .set({ 
      balance: newBalance,
      total_used: amount < 0 ? totalUsed + Math.abs(amount) : totalUsed,
      total_purchased: amount > 0 ? totalPurchased + amount : totalPurchased
    })
    .where(eq(credits.user_id, userId));

  return { ...credit, balance: newBalance, total_used: credit.total_used ?? 0, total_purchased: credit.total_purchased ?? 0 };
}

// Transactions functions
export async function createTransaction(data: {
  user_id: number;
  type: "PURCHASE" | "REFUND" | "BONUS" | "AFFILIATE_BONUS";
  credits_amount: number;
  amount_inr?: number | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status?: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  package_name?: string | null;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const insertData = {
    ...data,
    amount_inr: data.amount_inr !== undefined && data.amount_inr !== null ? data.amount_inr.toString() : null
  };
  const result = await db.insert(transactions).values(insertData);
  return result;
}

export async function getTransactionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(transactions)
    .where(eq(transactions.user_id, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// Generations functions
export async function createGeneration(data: {
  user_id: number;
  type: "IMAGE" | "VIDEO" | "STORY" | "AVATAR" | "BGREMOVE";
  prompt: string;
  credits_used: number;
  quality?: "standard" | "hd";
  output_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(generations).values(data);
  return result;
}

export async function getGenerationsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(generations)
    .where(eq(generations.user_id, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit);
}

export async function updateGenerationStatus(generationId: number, status: "PROCESSING" | "COMPLETED" | "FAILED", outputUrl?: string) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: any = { status };
  if (outputUrl) updateData.output_url = outputUrl;

  await db.update(generations)
    .set(updateData)
    .where(eq(generations.id, generationId));
}

// Subscriptions functions
export async function getOrCreateSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  let sub = await db.select().from(subscriptions).where(eq(subscriptions.user_id, userId)).limit(1);
  
  if (sub.length === 0) {
    await db.insert(subscriptions).values({ user_id: userId, plan: "FREE" });
    sub = await db.select().from(subscriptions).where(eq(subscriptions.user_id, userId)).limit(1);
  }
  
  return sub[0];
}

// Affiliates functions
export async function createAffiliate(userId: number, code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(affiliates).values({ user_id: userId, code });
  return result;
}

export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(affiliates).where(eq(affiliates.code, code)).limit(1);
  return result[0];
}

export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(affiliates).where(eq(affiliates.user_id, userId)).limit(1);
  return result[0];
}

export async function recordAffiliateReferral(affiliateId: number, referredUserId: number, purchaseAmount: number, commission: number) {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(affiliate_referrals).values({
    affiliate_id: affiliateId,
    referred_user_id: referredUserId,
    purchase_amount: purchaseAmount.toString(),
    commission_inr: commission.toString()
  });

  // Update affiliate stats
  await db.update(affiliates)
    .set({
      total_referrals: sql`total_referrals + 1`,
      total_earnings: sql`total_earnings + ${commission}`,
      pending_payout: sql`pending_payout + ${commission}`
    })
    .where(eq(affiliates.id, affiliateId));
}

// Articles functions
export async function getPublishedArticles(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(articles)
    .where(eq(articles.is_published, true))
    .orderBy(desc(articles.createdAt))
    .limit(limit);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0];
}

export async function createOrUpdateArticle(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  is_published?: boolean;
  seo_title?: string | null;
  seo_desc?: string | null;
}) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(articles).where(eq(articles.slug, data.slug)).limit(1);
  
  if (existing.length > 0) {
    await db.update(articles).set(data).where(eq(articles.slug, data.slug));
    return existing[0];
  } else {
    const result = await db.insert(articles).values(data);
    return result;
  }
}

// Policies functions
export async function getPolicyByType(type: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(policies).where(eq(policies.type, type)).limit(1);
  return result[0];
}

export async function createOrUpdatePolicy(type: string, content: string) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(policies).where(eq(policies.type, type)).limit(1);
  
  if (existing.length > 0) {
    await db.update(policies).set({ content }).where(eq(policies.type, type));
    return existing[0];
  } else {
    const result = await db.insert(policies).values({ type, content });
    return result;
  }
}

// Admin Config functions
export async function getConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(admin_config).where(eq(admin_config.key, key)).limit(1);
  return result[0]?.value;
}

export async function setConfig(key: string, value: string) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(admin_config).where(eq(admin_config.key, key)).limit(1);
  
  if (existing.length > 0) {
    await db.update(admin_config).set({ value }).where(eq(admin_config.key, key));
  } else {
    await db.insert(admin_config).values({ key, value });
  }
}

// User API Keys functions
export async function createUserApiKey(userId: number, provider: string, keyHash: string, label?: string | null) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(user_api_keys).values({
    user_id: userId,
    provider,
    key_hash: keyHash,
    label: label || null
  });
  return result;
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(user_api_keys)
    .where(and(eq(user_api_keys.user_id, userId), eq(user_api_keys.is_active, true)))
    .orderBy(desc(user_api_keys.createdAt));
}

// Admin functions
export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(users).limit(limit).offset(offset);
  return result;
}

export async function updateUserProfile(userId: number, data: { name?: string; mobile?: string }) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.mobile !== undefined) updateData.mobile = data.mobile;

  if (Object.keys(updateData).length === 0) {
    return getUserById(userId);
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const now = new Date();
  await db.update(users).set({ lastSignedIn: now, updatedAt: now }).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getAllGenerations(filter: "all" | "flagged" | "failed" = "all", limit = 50) {
  const db = await getDb();
  if (!db) return [];

  let baseQuery = db.select().from(generations);

  if (filter === "flagged") {
    const result = await baseQuery.where(eq(generations.is_flagged, true)).orderBy(desc(generations.createdAt)).limit(limit);
    return result;
  } else if (filter === "failed") {
    const result = await baseQuery.where(eq(generations.status, "FAILED")).orderBy(desc(generations.createdAt)).limit(limit);
    return result;
  } else {
    const result = await baseQuery.orderBy(desc(generations.createdAt)).limit(limit);
    return result;
  }
}


// Moderation functions
export async function getFlaggedGenerations(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(generations)
    .where(eq(generations.is_flagged, true))
    .orderBy(desc(generations.createdAt))
    .limit(limit);
}

export async function approveGeneration(generationId: number, adminId: number, adminNotes?: string) {
  const db = await getDb();
  if (!db) return undefined;

  // Update generation to not flagged
  await db.update(generations)
    .set({ is_flagged: false, flag_reason: null })
    .where(eq(generations.id, generationId));

  // Create violation record with APPROVED status
  return db.insert(user_violations).values({
    generation_id: generationId,
    user_id: 0, // Will be fetched from generation
    violation_type: "OTHER",
    status: "APPROVED",
    admin_notes: adminNotes,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
}

export async function rejectGeneration(generationId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  // Get generation to find user_id
  const gen = await db.select().from(generations).where(eq(generations.id, generationId)).limit(1);
  if (!gen.length) return undefined;

  // Update generation status to FAILED
  await db.update(generations)
    .set({ status: "FAILED", flag_reason: reason })
    .where(eq(generations.id, generationId));

  // Create violation record with REJECTED status
  return db.insert(user_violations).values({
    generation_id: generationId,
    user_id: gen[0].user_id,
    violation_type: "INAPPROPRIATE_CONTENT",
    status: "REJECTED",
    reason,
    admin_notes: reason,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
}

export async function warnUser(userId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  // Create violation record for warning
  return db.insert(user_violations).values({
    generation_id: 0,
    user_id: userId,
    violation_type: "OTHER",
    status: "PENDING",
    reason,
    warning_count: 1,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
}

export async function suspendUser(userId: number, adminId: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  // Deactivate user
  await db.update(users)
    .set({ is_active: false })
    .where(eq(users.id, userId));

  // Create violation record for suspension
  return db.insert(user_violations).values({
    generation_id: 0,
    user_id: userId,
    violation_type: "OTHER",
    status: "REJECTED",
    reason,
    is_account_suspended: true,
    suspension_reason: reason,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
}


// Analytics functions
export async function getGenerationTrends(days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = await db.select({
    date: sql`DATE(${generations.createdAt})`,
    count: sql`COUNT(*)`,
    type: generations.type,
  })
    .from(generations)
    .where(sql`DATE(${generations.createdAt}) >= ${startDateStr}`)
    .groupBy(sql`DATE(${generations.createdAt}), ${generations.type}`)
    .orderBy(sql`DATE(${generations.createdAt})`);

  return result;
}

export async function getRevenueMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalTransactions: 0, avgTransactionValue: 0 };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  const result = await db.select({
    totalRevenue: sql`SUM(${transactions.amount_inr})`,
    totalTransactions: sql`COUNT(*)`,
    avgTransactionValue: sql`AVG(${transactions.amount_inr})`,
  })
    .from(transactions)
    .where(sql`${transactions.createdAt} >= ${startDateStr}`);

  return {
    totalRevenue: result[0]?.totalRevenue || 0,
    totalTransactions: result[0]?.totalTransactions || 0,
    avgTransactionValue: result[0]?.avgTransactionValue || 0,
  };
}

export async function getTopUsers(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    userId: users.id,
    name: users.name,
    email: users.email,
    generationCount: sql`COUNT(${generations.id})`,
    creditsUsed: sql`SUM(${generations.credits_used})`,
  })
    .from(users)
    .leftJoin(generations, eq(users.id, generations.user_id))
    .groupBy(users.id)
    .orderBy(sql`COUNT(${generations.id}) DESC`)
    .limit(limit);
}

export async function getGenerationStats() {
  const db = await getDb();
  if (!db) return { total: 0, byType: {}, byStatus: {} };

  const total = await db.select({ count: sql`COUNT(*)` }).from(generations);

  const byType = await db.select({
    type: generations.type,
    count: sql`COUNT(*)`,
  })
    .from(generations)
    .groupBy(generations.type);

  const byStatus = await db.select({
    status: generations.status,
    count: sql`COUNT(*)`,
  })
    .from(generations)
    .groupBy(generations.status);

  return {
    total: total[0]?.count || 0,
    byType: Object.fromEntries(byType.map((t: any) => [t.type, t.count])),
    byStatus: Object.fromEntries(byStatus.map((s: any) => [s.status, s.count])),
  };
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, verified: 0, admins: 0 };

  const total = await db.select({ count: sql`COUNT(*)` }).from(users);
  const active = await db.select({ count: sql`COUNT(*)` }).from(users).where(eq(users.is_active, true));
  const verified = await db.select({ count: sql`COUNT(*)` }).from(users).where(eq(users.is_verified, true));
  const admins = await db.select({ count: sql`COUNT(*)` }).from(users).where(eq(users.role, "admin"));

  return {
    total: total[0]?.count || 0,
    active: active[0]?.count || 0,
    verified: verified[0]?.count || 0,
    admins: admins[0]?.count || 0,
  };
}

export async function getCreditMetrics() {
  const db = await getDb();
  if (!db) return { totalPurchased: 0, totalUsed: 0, totalAvailable: 0 };

  const result = await db.select({
    totalPurchased: sql`SUM(${credits.total_purchased})`,
    totalUsed: sql`SUM(${credits.total_used})`,
    totalAvailable: sql`SUM(${credits.balance})`,
  })
    .from(credits);

  return {
    totalPurchased: result[0]?.totalPurchased || 0,
    totalUsed: result[0]?.totalUsed || 0,
    totalAvailable: result[0]?.totalAvailable || 0,
  };
}

export async function getAffiliateMetrics() {
  const db = await getDb();
  if (!db) return { totalAffiliates: 0, totalReferrals: 0, totalCommissions: 0 };

  const affiliateCount = await db.select({ count: sql`COUNT(*)` }).from(affiliates);
  const referralCount = await db.select({ count: sql`COUNT(*)` }).from(affiliate_referrals);
  const commissionTotal = await db.select({
    total: sql`SUM(${affiliate_referrals.commission_inr})`,
  })
    .from(affiliate_referrals);

  return {
    totalAffiliates: affiliateCount[0]?.count || 0,
    totalReferrals: referralCount[0]?.count || 0,
    totalCommissions: commissionTotal[0]?.total || 0,
  };
}


// Daily Active Users (DAU) and Retention Analytics
export async function getDailyActiveUsers(days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Use raw SQL to avoid GROUP BY issues with MySQL strict mode
  const result = await db.execute(sql`
    SELECT 
      DATE(${generations.createdAt}) as date,
      COUNT(DISTINCT ${generations.user_id}) as activeUsers,
      COUNT(*) as generationCount
    FROM ${generations}
    WHERE DATE(${generations.createdAt}) >= ${startDateStr}
    GROUP BY DATE(${generations.createdAt})
    ORDER BY DATE(${generations.createdAt})
  `);

  return result as any[];
}

export async function getRetentionCohorts(days = 30) {
  const db = await getDb();
  if (!db) return [];

  // Get cohorts of users by signup date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = await db.select({
    cohortDate: sql`DATE(${users.createdAt})`,
    cohortSize: sql`COUNT(DISTINCT ${users.id})`,
    activeInCohort: sql`COUNT(DISTINCT CASE WHEN DATE(${generations.createdAt}) >= DATE(${users.createdAt}) THEN ${generations.user_id} END)`,
    generationsInCohort: sql`COUNT(${generations.id})`,
  })
    .from(users)
    .leftJoin(generations, eq(users.id, generations.user_id))
    .where(sql`DATE(${users.createdAt}) >= ${startDateStr}`)
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt}) DESC`);

  return result;
}

export async function getUserRetentionByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Calculate retention: users who were active today and were also active in the past
  // Use raw SQL to avoid GROUP BY issues with MySQL strict mode
  const result = await db.execute(sql`
    SELECT 
      DATE(${generations.createdAt}) as date,
      COUNT(DISTINCT CASE WHEN DATE(${users.createdAt}) = DATE(${generations.createdAt}) THEN ${generations.user_id} END) as newUsers,
      COUNT(DISTINCT CASE WHEN DATE(${users.createdAt}) < DATE(${generations.createdAt}) THEN ${generations.user_id} END) as returningUsers,
      COUNT(DISTINCT ${generations.user_id}) as totalActiveUsers
    FROM ${generations}
    LEFT JOIN ${users} ON ${generations.user_id} = ${users.id}
    WHERE DATE(${generations.createdAt}) >= ${startDateStr}
    GROUP BY DATE(${generations.createdAt})
    ORDER BY DATE(${generations.createdAt})
  `);

  return result as any[];
}

export async function getWeeklyActiveUsers(weeks = 12) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Use raw SQL to avoid GROUP BY issues
  const result = await db.execute(sql`
    SELECT 
      CONCAT(YEAR(${generations.createdAt}), '-W', WEEK(${generations.createdAt})) as week,
      COUNT(DISTINCT ${generations.user_id}) as activeUsers,
      COUNT(*) as generationCount
    FROM ${generations}
    WHERE DATE(${generations.createdAt}) >= ${startDateStr}
    GROUP BY YEAR(${generations.createdAt}), WEEK(${generations.createdAt})
    ORDER BY YEAR(${generations.createdAt}), WEEK(${generations.createdAt})
  `);

  return result as any[];
}

export async function getMonthlyActiveUsers(months = 12) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Use raw SQL to avoid GROUP BY issues
  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(${generations.createdAt}, '%Y-%m') as month,
      COUNT(DISTINCT ${generations.user_id}) as activeUsers,
      COUNT(*) as generationCount,
      COUNT(DISTINCT CASE WHEN DATE_FORMAT(${users.createdAt}, '%Y-%m') = DATE_FORMAT(${generations.createdAt}, '%Y-%m') THEN ${generations.user_id} END) as newUsers
    FROM ${generations}
    LEFT JOIN ${users} ON ${generations.user_id} = ${users.id}
    WHERE DATE(${generations.createdAt}) >= ${startDateStr}
    GROUP BY DATE_FORMAT(${generations.createdAt}, '%Y-%m')
    ORDER BY DATE_FORMAT(${generations.createdAt}, '%Y-%m')
  `);

  return result as any[];
}

export async function getUserChurnRate(days = 30) {
  const db = await getDb();
  if (!db) return { churnRate: 0, activeUsers: 0, inactiveUsers: 0 };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // Users who were active in the period
  const activeInPeriod = await db.select({ count: sql`COUNT(DISTINCT ${generations.user_id})` })
    .from(generations)
    .where(sql`${generations.createdAt} >= ${startDateStr}`);

  // Users who were active but haven't been in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const churned = await db.select({ count: sql`COUNT(DISTINCT ${users.id})` })
    .from(users)
    .leftJoin(generations, eq(users.id, generations.user_id))
    .where(and(
      sql`${users.createdAt} < ${startDateStr}`,
      sql`${generations.createdAt} IS NULL OR ${generations.createdAt} < ${sevenDaysAgoStr}`
    ));

  const totalUsers = await db.select({ count: sql`COUNT(*)` }).from(users);

  const totalCount = Number(totalUsers[0]?.count) || 1;
  const churnedCount = Number(churned[0]?.count) || 0;
  const churnRate = totalCount ? churnedCount / totalCount : 0;

  return {
    churnRate: Math.round(churnRate * 100 * 100) / 100,
    activeUsers: Number(activeInPeriod[0]?.count) || 0,
    inactiveUsers: churnedCount,
  };
}

export async function getCohortRetentionMatrix(days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // Get users by signup cohort and their activity in subsequent days
  const result = await db.select({
    cohortDate: sql`DATE(${users.createdAt})`,
    daysSinceSignup: sql`DATEDIFF(DATE(${generations.createdAt}), DATE(${users.createdAt}))`,
    activeCount: sql`COUNT(DISTINCT ${generations.user_id})`,
  })
    .from(users)
    .leftJoin(generations, eq(users.id, generations.user_id))
    .where(sql`DATE(${users.createdAt}) >= ${startDateStr}`)
    .groupBy(sql`DATE(${users.createdAt}), DATEDIFF(DATE(${generations.createdAt}), DATE(${users.createdAt}))`)
    .orderBy(sql`DATE(${users.createdAt}), DATEDIFF(DATE(${generations.createdAt}), DATE(${users.createdAt}))`);

  return result;
}


// Export types for testing
export type DailyActiveUsersResult = Awaited<ReturnType<typeof getDailyActiveUsers>>;
export type RetentionCohortsResult = Awaited<ReturnType<typeof getRetentionCohorts>>;
export type UserRetentionByDayResult = Awaited<ReturnType<typeof getUserRetentionByDay>>;
export type WeeklyActiveUsersResult = Awaited<ReturnType<typeof getWeeklyActiveUsers>>;
export type MonthlyActiveUsersResult = Awaited<ReturnType<typeof getMonthlyActiveUsers>>;
export type UserChurnRateResult = Awaited<ReturnType<typeof getUserChurnRate>>;
export type CohortRetentionMatrixResult = Awaited<ReturnType<typeof getCohortRetentionMatrix>>;


// 404 Tracking Analytics
export async function track404(data: InsertNotFoundTracking): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track 404: database not available");
    return;
  }

  try {
    await db.insert(notFoundTracking).values(data);
  } catch (error) {
    console.warn("[Database] Failed to track 404:", error);
  }
}

export async function get404Stats(days = 30) {
  const db = await getDb();
  if (!db) return { total: 0, unique_paths: 0, top_paths: [] };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  try {
    // Get total 404s
    const totalResult = await db.select({
      count: sql`COUNT(*) as total`,
    })
      .from(notFoundTracking)
      .where(sql`DATE(${notFoundTracking.createdAt}) >= ${startDateStr}`);

    const total = Number(totalResult[0]?.count || 0);

    // Get unique paths
    const uniquePathsResult = await db.select({
      count: sql`COUNT(DISTINCT ${notFoundTracking.attempted_path}) as unique_paths`,
    })
      .from(notFoundTracking)
      .where(sql`DATE(${notFoundTracking.createdAt}) >= ${startDateStr}`);

    const unique_paths = Number(uniquePathsResult[0]?.count || 0);

    // Get top 404 paths
    const topPathsResult = await db.select({
      path: notFoundTracking.attempted_path,
      count: sql`COUNT(*) as hit_count`,
    })
      .from(notFoundTracking)
      .where(sql`DATE(${notFoundTracking.createdAt}) >= ${startDateStr}`)
      .groupBy(notFoundTracking.attempted_path)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    const top_paths = topPathsResult.map((r: any) => ({
      path: r.path,
      hits: Number(r.hit_count || 0),
    }));

    return { total, unique_paths, top_paths };
  } catch (error) {
    console.warn("[Database] Failed to get 404 stats:", error);
    return { total: 0, unique_paths: 0, top_paths: [] };
  }
}

export async function get404ByPath(path: string, days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  try {
    const result = await db.select({
      date: sql`DATE(${notFoundTracking.createdAt}) as date`,
      count: sql`COUNT(*) as hit_count`,
    })
      .from(notFoundTracking)
      .where(and(
        sql`${notFoundTracking.attempted_path} = ${path}`,
        sql`DATE(${notFoundTracking.createdAt}) >= ${startDateStr}`
      ))
      .groupBy(sql`DATE(${notFoundTracking.createdAt})`)
      .orderBy(sql`DATE(${notFoundTracking.createdAt})`);

    return result.map((r: any) => ({
      date: r.date,
      hits: Number(r.hit_count || 0),
    }));
  } catch (error) {
    console.warn("[Database] Failed to get 404 by path:", error);
    return [];
  }
}
