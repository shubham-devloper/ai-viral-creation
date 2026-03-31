import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { paymentRouter } from "./payment";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  payment: paymentRouter,

  // Auth routes
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      const user = await db.getUserById(opts.ctx.user.id);
      if (!user) return null;

      const credits = await db.getOrCreateCredits(user.id);
      const subscription = await db.getOrCreateSubscription(user.id);

      return {
        ...user,
        credits: credits?.balance ?? 0,
        plan: subscription?.plan ?? "FREE",
      };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    verifyAge: publicProcedure
      .input(z.object({ birthDate: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Calculate age from birth date
        const birthDateObj = new Date(input.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }

        if (age < 18) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Must be at least 18 years old" });
        }

        // If user is authenticated, update their record
        if (ctx.user) {
          // Update user's age_verified flag in database
          // This would require an update function in db.ts
        }

        return { success: true };
      }),
  }),

  // Credits routes
  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credit = await db.getOrCreateCredits(ctx.user!.id);
      return { balance: credit?.balance ?? 0 };
    }),

    getTransactionHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getTransactionsByUser(ctx.user!.id, input.limit);
      }),
  }),

  // Generation routes
  generation: router({
    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["IMAGE", "VIDEO", "STORY", "AVATAR"]),
          prompt: z.string().min(10).max(2000),
          quality: z.enum(["standard", "hd"]).default("standard"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check credits
        const credits = await db.getOrCreateCredits(ctx.user!.id);
        const creditCosts: Record<string, Record<string, number>> = {
          IMAGE: { standard: 5, hd: 8 },
          VIDEO: { standard: 20, hd: 30 },
          STORY: { standard: 2, hd: 5 },
          AVATAR: { standard: 10, hd: 15 },
        };

        const costRequired = creditCosts[input.type]?.[input.quality] ?? 5;

        if ((credits?.balance ?? 0) < costRequired) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient credits. Need ${costRequired}, have ${credits?.balance ?? 0}`,
          });
        }

        // Create generation record
        const generation = await db.createGeneration({
          user_id: ctx.user!.id,
          type: input.type as "IMAGE" | "VIDEO" | "STORY" | "AVATAR",
          prompt: input.prompt,
          quality: input.quality as "standard" | "hd",
          credits_used: costRequired,
        });

        // Deduct credits
        await db.updateCredits(ctx.user!.id, -costRequired, "Generation");

        return { success: true, message: "Generation started" };
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getGenerationsByUser(ctx.user!.id, input.limit);
      }),
  }),

  // Affiliate routes
  affiliate: router({
    getCode: protectedProcedure.query(async ({ ctx }) => {
      let affiliate = await db.getAffiliateByUserId(ctx.user!.id);

      if (!affiliate) {
        // Generate unique code
        const code = `AVC${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await db.createAffiliate(ctx.user!.id, code);
        affiliate = await db.getAffiliateByUserId(ctx.user!.id);
      }

      return affiliate;
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user!.id);
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
      }
      return affiliate;
    }),
  }),

  // Admin routes
  admin: router({
    users: router({
      list: adminProcedure
        .input(
          z.object({
            search: z.string().optional(),
            limit: z.number().default(50),
          })
        )
        .query(async ({ input }) => {
          // This would require a query function in db.ts
          return [];
        }),

      getById: adminProcedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ input }) => {
          return db.getUserById(input.userId);
        }),

      addCredits: adminProcedure
        .input(
          z.object({
            userId: z.number(),
            amount: z.number(),
            reason: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          await db.updateCredits(input.userId, input.amount, input.reason);
          return { success: true };
        }),
    }),

    generations: router({
      list: adminProcedure
        .input(
          z.object({
            filter: z.enum(["all", "flagged", "failed"]).default("all"),
            limit: z.number().default(50),
          })
        )
        .query(async ({ input }) => {
          // This would require a query function in db.ts
          return [];
        }),

      flag: adminProcedure
        .input(
          z.object({
            generationId: z.number(),
            reason: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          // This would require an update function in db.ts
          return { success: true };
        }),
    }),

    config: router({
      get: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          return db.getConfig(input.key);
        }),

      set: adminProcedure
        .input(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          await db.setConfig(input.key, input.value);
          return { success: true };
        }),
    }),

    articles: router({
      create: adminProcedure
        .input(
          z.object({
            title: z.string(),
            slug: z.string(),
            content: z.string(),
            excerpt: z.string().optional(),
            cover_image: z.string().optional(),
            seo_title: z.string().optional(),
            seo_desc: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          await db.createOrUpdateArticle({
            ...input,
            is_published: false,
          });
          return { success: true };
        }),

      publish: adminProcedure
        .input(z.object({ slug: z.string() }))
        .mutation(async ({ input }) => {
          const article = await db.getArticleBySlug(input.slug);
          if (!article) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
          }
          await db.createOrUpdateArticle({
            ...article,
            is_published: true,
          });
          return { success: true };
        }),
    }),

    policies: router({
      get: adminProcedure
        .input(z.object({ type: z.string() }))
        .query(async ({ input }) => {
          return db.getPolicyByType(input.type);
        }),

      update: adminProcedure
        .input(
          z.object({
            type: z.string(),
            content: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          await db.createOrUpdatePolicy(input.type, input.content);
          return { success: true };
        }),
    }),
  }),

  // Public routes
  public: router({
    articles: router({
      list: publicProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ input }) => {
          return db.getPublishedArticles(input.limit);
        }),

      getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input }) => {
          return db.getArticleBySlug(input.slug);
        }),
    }),

    policy: router({
      get: publicProcedure
        .input(z.object({ type: z.string() }))
        .query(async ({ input }) => {
          return db.getPolicyByType(input.type);
        }),
    }),

    affiliate: router({
      getByCode: publicProcedure
        .input(z.object({ code: z.string() }))
        .query(async ({ input }) => {
          const affiliate = await db.getAffiliateByCode(input.code);
          if (!affiliate) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate code not found" });
          }
          return {
            code: affiliate.code,
            total_referrals: affiliate.total_referrals,
          };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
