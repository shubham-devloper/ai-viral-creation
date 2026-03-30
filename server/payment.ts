import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { createRazorpayOrder, getCreditPackage, CREDIT_PACKAGES } from "./_core/razorpay";

/**
 * Payment Router - Handles all payment-related operations
 */
export const paymentRouter = router({
  // Get available credit packages
  getPackages: protectedProcedure.query(async () => {
    return CREDIT_PACKAGES.map((pkg) => ({
      id: pkg.id,
      credits: pkg.credits,
      priceInr: pkg.priceInr,
      discount: pkg.discount,
      pricePerCredit: (pkg.priceInr / pkg.credits).toFixed(2),
    }));
  }),

  // Create a Razorpay order for credit purchase
  createOrder: protectedProcedure
    .input(z.object({ packageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pkg = getCreditPackage(input.packageId);

      if (!pkg) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid credit package",
        });
      }

      try {
        // Create Razorpay order
        const order = await createRazorpayOrder({
          amount: pkg.priceInr * 100, // Convert to paise
          currency: "INR",
          receipt: `order_${ctx.user!.id}_${Date.now()}`,
          description: `${pkg.credits} Credits for AI Viral Creation`,
          notes: {
            userId: ctx.user!.id.toString(),
            packageId: input.packageId,
            credits: pkg.credits.toString(),
          },
        });

        // Save pending transaction in database
        await db.createTransaction({
          user_id: ctx.user!.id,
          type: "PURCHASE",
          credits_amount: pkg.credits,
          amount_inr: pkg.priceInr,
          status: "PENDING",
          razorpay_order_id: order.id,
          package_name: input.packageId,
        });

        return {
          orderId: order.id,
          amount: pkg.priceInr,
          currency: "INR",
          credits: pkg.credits,
          key: process.env.RAZORPAY_KEY_ID || "",
        };
      } catch (error) {
        console.error("Failed to create Razorpay order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment order",
        });
      }
    }),

  // Verify payment and update credits
  verifyPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentId: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the payment signature
        const { verifyPaymentSignature } = await import("./_core/razorpay");
        const isValid = verifyPaymentSignature(input.orderId, input.paymentId, input.signature);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid payment signature",
          });
        }

        // Get transactions and find matching one
        const transactions = await db.getTransactionsByUser(ctx.user!.id, 100);
        const transaction = transactions.find((t) => t.razorpay_order_id === input.orderId);

        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found",
          });
        }

        if (transaction.user_id !== ctx.user!.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Unauthorized",
          });
        }

        // Create success transaction record
        await db.createTransaction({
          user_id: ctx.user!.id,
          type: "PURCHASE",
          credits_amount: transaction.credits_amount,
          amount_inr: transaction.amount_inr ? parseFloat(transaction.amount_inr.toString()) : undefined,
          status: "SUCCESS",
          razorpay_order_id: input.orderId,
          razorpay_payment_id: input.paymentId,
          package_name: transaction.package_name || undefined,
        });

        // Add credits to user account
        await db.updateCredits(ctx.user!.id, transaction.credits_amount, "Payment");

        return {
          success: true,
          creditsAdded: transaction.credits_amount,
          message: "Payment verified and credits added successfully",
        };
      } catch (error) {
        console.error("Payment verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Payment verification failed",
        });
      }
    }),

  // Get transaction history
  getTransactionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return db.getTransactionsByUser(ctx.user!.id, input.limit);
    }),
});

export type PaymentRouter = typeof paymentRouter;
