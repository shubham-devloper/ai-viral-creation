import crypto from "crypto";
import { ENV } from "./env";

/**
 * Razorpay Payment Integration
 * Handles order creation, payment verification, and webhook processing
 */

export interface RazorpayOrderOptions {
  amount: number; // Amount in paise (multiply by 100 for INR)
  currency?: string;
  receipt?: string;
  description?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_reason: string | null;
  error_step: string | null;
  error_field: string | null;
  acquirer_data: Record<string, string>;
  created_at: number;
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency || "INR",
      receipt: options.receipt || `receipt_${Date.now()}`,
      description: options.description || "AI Viral Creation - Credits Purchase",
      notes: options.notes || {},
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Razorpay order: ${error}`);
  }

  return response.json();
}

/**
 * Verify payment signature
 * This should be called when receiving webhook or payment completion
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!ENV.razorpayKeySecret) {
    throw new Error("Razorpay key secret not configured");
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac("sha256", ENV.razorpayKeySecret).update(body).digest("hex");

  return expectedSignature === signature;
}

/**
 * Verify webhook signature
 * This should be called when receiving Razorpay webhooks
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!ENV.razorpayWebhookSecret) {
    throw new Error("Razorpay webhook secret not configured");
  }

  const expectedSignature = crypto.createHmac("sha256", ENV.razorpayWebhookSecret).update(body).digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch payment details: ${error}`);
  }

  return response.json();
}

/**
 * Fetch order details from Razorpay
 */
export async function getOrderDetails(orderId: string): Promise<RazorpayOrder> {
  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch order details: ${error}`);
  }

  return response.json();
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentId: string, amount?: number): Promise<any> {
  if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");

  const body: any = {};
  if (amount) {
    body.amount = amount;
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refund payment: ${error}`);
  }

  return response.json();
}

/**
 * Credit package definitions
 */
export const CREDIT_PACKAGES = [
  { id: "starter", credits: 100, priceInr: 99, discount: 0 },
  { id: "basic", credits: 500, priceInr: 399, discount: 5 },
  { id: "pro", credits: 1000, priceInr: 699, discount: 10 },
  { id: "premium", credits: 2500, priceInr: 1499, discount: 15 },
];

/**
 * Get credit package by ID
 */
export function getCreditPackage(packageId: string) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
}
