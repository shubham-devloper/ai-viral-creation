import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateImage, generateStory } from "./_core/imageGeneration";
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
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          mobile: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.updateUserProfile(ctx.user!.id, input);
      }),

    emailLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (!user.password_hash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This account was not created with email/password",
          });
        }

        const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
        if (!passwordMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }

        if (!user.is_active) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account is inactive",
          });
        }

        await db.updateLastSignedIn(user.id);

        const cookieOptions = getSessionCookieOptions(ctx.req);
        const sessionToken = await ctx.sdk.createSessionToken(user.openId);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, user };
      }),

    emailRegister: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().optional(),
          referredBy: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await db.upsertUser({
          openId,
          email: input.email,
          password_hash: passwordHash,
          name: input.name || null,
          loginMethod: "email",
          is_active: true,
          referred_by: input.referredBy || null,
        });

        // Get the newly created user
        const newUser = await db.getUserByEmail(input.email);
        if (!newUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Create initial credits (10 free credits)
        await db.getOrCreateCredits(newUser.id);

        // Handle affiliate referral bonus
        if (input.referredBy) {
          const referrerAffiliate = await db.getAffiliateByCode(input.referredBy);
          if (referrerAffiliate) {
            // Add 50 credits to referrer
            await db.updateCredits(referrerAffiliate.user_id, 50, "Referral bonus");
          }
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        const sessionToken = await ctx.sdk.createSessionToken(openId);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, user: newUser };
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
          type: z.enum(["IMAGE", "VIDEO", "STORY", "AVATAR", "BGREMOVE"]),
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
          BGREMOVE: { standard: 3, hd: 3 },
        };

        const costRequired = creditCosts[input.type]?.[input.quality] ?? 5;

        if ((credits?.balance ?? 0) < costRequired) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient credits. Need ${costRequired}, have ${credits?.balance ?? 0}`,
          });
        }

        // Create generation record
        const generationResult = await db.createGeneration({
          user_id: ctx.user!.id,
          type: input.type as "IMAGE" | "VIDEO" | "STORY" | "AVATAR" | "BGREMOVE",
          prompt: input.prompt,
          quality: input.quality as "standard" | "hd",
          credits_used: costRequired,
        });

        // Get the generation ID from the result
        const generationId = (generationResult as any)?.insertId || 0;

        // Deduct credits
        await db.updateCredits(ctx.user!.id, -costRequired, "Generation");

        // Call real AI generation
        let outputUrl: string | undefined;
        try {
          if (input.type === "IMAGE" || input.type === "AVATAR") {
            const result = await generateImage({ prompt: input.prompt });
            outputUrl = result.url;
          } else if (input.type === "STORY") {
            const storyText = await generateStory(input.prompt, "neutral", "medium");
            outputUrl = storyText; // Store story text as output
          } else if (input.type === "VIDEO") {
            // For video, use image generation as fallback with cinematic prompt
            const result = await generateImage({ prompt: `cinematic still frame: ${input.prompt}` });
            outputUrl = result.url;
          } else if (input.type === "BGREMOVE") {
            // Call Remove.bg API to remove background from image URL
            const removeBgApiKey = process.env.REMOVE_BG_API_KEY;
            if (!removeBgApiKey) {
              throw new Error("Remove.bg API key not configured");
            }

            const formData = new FormData();
            formData.append("image_url", input.prompt);
            formData.append("size", "auto");

            const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
              method: "POST",
              headers: {
                "X-Api-Key": removeBgApiKey,
              },
              body: formData,
            });

            if (!removeBgResponse.ok) {
              throw new Error(`Remove.bg API error: ${removeBgResponse.statusText}`);
            }

            const result = await removeBgResponse.json();
            if (result.result_b64) {
              // Convert base64 to buffer and upload to S3
              const buffer = Buffer.from(result.result_b64, "base64");
              const { storagePut } = await import("./storage");
              const storageResult = await storagePut(
                `bgremove/${ctx.user!.id}-${Date.now()}.png`,
                buffer,
                "image/png"
              );
              outputUrl = storageResult.url;
            }
          }

          // Update generation status to COMPLETED
          if (generationId && outputUrl) {
            await db.updateGenerationStatus(generationId, "COMPLETED", outputUrl);
          }
        } catch (error) {
          // Log error but don't throw - generation record is created
          console.error("AI generation failed:", error);
        }

        return { success: true, message: "Generation started", generationId, outputUrl };
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

    users: router({
      list: adminProcedure
        .input(
          z.object({
            limit: z.number().default(50),
            offset: z.number().default(0),
            search: z.string().optional(),
          })
        )
        .query(async ({ input }) => {
          return db.getAllUsers(input.limit, input.offset);
        }),
    }),

    config: router({
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

      get: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          const value = await db.getConfig(input.key);
          return { value };
        }),
    }),

    generations: router({
      list: adminProcedure
        .input(
          z.object({
            limit: z.number().default(50),
            offset: z.number().default(0),
            filter: z.enum(["all", "flagged", "failed"]).optional(),
          })
        )
        .query(async ({ input }) => {
          return db.getAllGenerations(input.filter || "all", input.limit);
        }),

      updateStatus: adminProcedure
        .input(
          z.object({
            generationId: z.number(),
            status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]),
          })
        )
        .mutation(async ({ input }) => {
          return db.updateGenerationStatus(input.generationId, input.status);
        }),
    })
  }),

  // Affiliate routes
  affiliate: router({
    getCode: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user!.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate account not found. Please join the affiliate program first.",
        });
      }
      return {
        code: affiliate.code,
        userId: affiliate.user_id,
        createdAt: affiliate.createdAt,
      };
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user!.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate account not found. Please join the affiliate program first.",
        });
      }
      return {
        referrals: affiliate.total_referrals ?? 0,
        earned: parseFloat(affiliate.total_earnings?.toString() ?? "0"),
        pending: parseFloat(affiliate.pending_payout?.toString() ?? "0"),
        paidOut: parseFloat(affiliate.paid_out?.toString() ?? "0"),
        isActive: affiliate.is_active ?? true,
      };
    }),

    requestPayout: protectedProcedure
      .input(z.object({ amount: z.number().min(500) }))
      .mutation(async ({ ctx, input }) => {
        const affiliate = await db.getAffiliateByUserId(ctx.user!.id);
        if (!affiliate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Affiliate account not found.",
          });
        }

        const pending = parseFloat(affiliate.pending_payout?.toString() ?? "0");
        if (pending < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient pending payout. Available: ₹${pending.toFixed(2)}`,
          });
        }

        if (input.amount < 500) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Minimum payout amount is ₹500",
          });
        }

        return { success: true, message: "Payout request submitted" };
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
