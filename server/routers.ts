import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { paymentRouter } from "./payment";
import { validatePrompt, checkPlanRestrictions } from "./_core/moderation";
import { checkGenerationRateLimit } from "./_core/rateLimit";

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

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    verifyAge: protectedProcedure
      .input(z.object({ birthDate: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const birthDate = new Date(input.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You must be at least 18 years old to use this service",
          });
        }

        return { success: true, age };
      }),
  }),

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
        // 0. Check rate limit (max 5 generations per minute)
        const rateLimit = checkGenerationRateLimit(String(ctx.user!.id), 5);
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
          });
        }

        // 1. Validate prompt for prohibited content
        const moderation = validatePrompt(input.prompt);
        if (!moderation.isAllowed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: moderation.reason || "Prompt contains prohibited content",
          });
        }

        // 2. Check user's subscription plan
        const subscription = await db.getOrCreateSubscription(ctx.user!.id);
        const plan = (subscription?.plan ?? "FREE") as "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
        
        if (!checkPlanRestrictions(plan, input.type, input.quality)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Your ${plan} plan does not support ${input.quality} ${input.type.toLowerCase()} generation. Please upgrade.`,
          });
        }

        // 3. Check credits
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

        return { success: true, message: "Generation started", generationId: 0 };
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getGenerationsByUser(ctx.user!.id, input.limit);
      }),
  }),

  // Admin routes
  admin: router({
    dashboard: adminProcedure.query(async () => {
      return {
        totalUsers: 1250,
        totalGenerations: 5420,
        totalCreditsUsed: 28500,
        totalRevenue: 12500,
      };
    }),

    users: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          search: z.string().optional(),
        })
      )
      .query(async () => {
        return [];
      }),

    generations: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]).optional(),
        })
      )
      .query(async () => {
        return [];
      }),

    updateGenerationStatus: adminProcedure
      .input(
        z.object({
          generationId: z.number(),
          status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateGenerationStatus(input.generationId, input.status);
      }),
  }),

  // Profile routes
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user!.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.getUserById(ctx.user!.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
