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
});
