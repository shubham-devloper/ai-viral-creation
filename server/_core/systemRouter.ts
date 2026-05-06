import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import * as db from "../db";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  track404: publicProcedure
    .input(
      z.object({
        attempted_path: z.string().min(1, "path is required"),
        referrer: z.string().optional(),
        user_agent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.track404({
        user_id: ctx.user?.id,
        attempted_path: input.attempted_path,
        referrer: input.referrer,
        user_agent: input.user_agent,
      });
      return { success: true } as const;
    }),

  trackPerformance: publicProcedure
    .input(
      z.object({
        route_path: z.string().min(1, "route path is required"),
        page_load_time: z.number().min(0),
        referrer: z.string().optional(),
        device_type: z.string().optional(),
        browser: z.string().optional(),
        recordId: z.number().optional(),
        time_on_page: z.number().optional(),
        had_interaction: z.boolean().optional(),
        bounce: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If recordId is provided, update existing record
      if (input.recordId) {
        await db.updateRouteEngagement(input.recordId, {
          time_on_page: input.time_on_page,
          had_interaction: input.had_interaction,
          bounce: input.bounce,
        });
        return { success: true, recordId: input.recordId } as const;
      }

      // Otherwise create new record
      const recordId = Math.floor(Math.random() * 1000000); // Temporary ID for client reference
      await db.trackRoutePerformance({
        route_path: input.route_path,
        user_id: ctx.user?.id,
        page_load_time: input.page_load_time,
        referrer: input.referrer,
        device_type: input.device_type,
        browser: input.browser,
      });
      return { success: true, recordId } as const;
    }),
});
