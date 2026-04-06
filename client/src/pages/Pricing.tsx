import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Star, Flame, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  icon: React.ReactNode;
  popular: boolean;
  features: string[];
  color: string;
  textColor: string;
  borderColor: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 79,
    pricePerCredit: 0.79,
    icon: <Zap className="w-6 h-6" />,
    popular: false,
    features: [
      "100 Credits",
      "Image Generation",
      "Story Generation",
      "Avatar Creation",
      "7-day credit expiry",
      "Email support",
    ],
    color: "from-blue-500/10 to-blue-500/5",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/20",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    price: 199,
    pricePerCredit: 0.398,
    icon: <Star className="w-6 h-6" />,
    popular: true,
    features: [
      "500 Credits",
      "All Starter features",
      "Video Generation",
      "Priority processing",
      "30-day credit expiry",
      "Priority support",
      "Bulk discount (10%)",
    ],
    color: "from-purple-500/10 to-purple-500/5",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/20",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 499,
    pricePerCredit: 0.2495,
    icon: <Flame className="w-6 h-6" />,
    popular: false,
    features: [
      "2000 Credits",
      "All Pro features",
      "Custom integrations",
      "Instant processing",
      "90-day credit expiry",
      "Dedicated support",
      "Bulk discount (20%)",
      "API access",
    ],
    color: "from-red-500/10 to-red-500/5",
    textColor: "text-red-400",
    borderColor: "border-red-500/20",
  },
];

const creditCosts = [
  { type: "Image (Standard)", cost: 5 },
  { type: "Image (HD)", cost: 8 },
  { type: "Story (Standard)", cost: 2 },
  { type: "Story (HD)", cost: 5 },
  { type: "Avatar (Standard)", cost: 10 },
  { type: "Avatar (HD)", cost: 15 },
  { type: "Video (Standard)", cost: 20 },
  { type: "Video (HD)", cost: 30 },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderMutation = trpc.payment.createOrder.useMutation();
  const verifyPaymentMutation = trpc.payment.verifyPayment.useMutation();

  const handleBuy = async (planId: string, price: number) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    setIsProcessing(true);
    try {
      // Create order
      const order = await createOrderMutation.mutateAsync({ packageId: planId });

      if (!order.orderId) {
        toast.error("Failed to create order");
        return;
      }

      // Initialize Razorpay
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        toast.error("Razorpay configuration missing");
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: Math.round(price * 100), // Convert to paise
        currency: "INR",
        name: "AI Viral Creation",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const result = await verifyPaymentMutation.mutateAsync({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (result.success) {
              toast.success("Payment successful! Credits added.");
              setLocation("/dashboard/credits");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.name || "",
        },
        theme: {
          color: "#9333ea",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Choose the perfect plan for your AI content creation needs
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-gray-400">Pay as you go</span>
            <div className="bg-slate-800 rounded-full p-1 flex gap-1">
              <button className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium">
                Monthly
              </button>
              <button className="px-4 py-2 rounded-full text-gray-400 text-sm font-medium hover:text-white">
                Annual (Save 20%)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-gradient-to-br ${plan.color} border ${plan.borderColor} overflow-hidden transition-transform hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className={plan.textColor}>{plan.icon}</div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {plan.credits} credits • ₹{plan.pricePerCredit.toFixed(2)}/credit
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={() => handleBuy(plan.id, plan.price)}
                  disabled={isProcessing}
                  className={`w-full ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-slate-700 hover:bg-slate-600"
                  } text-white disabled:opacity-50`}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Buy {plan.name}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${plan.textColor}`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit Costs Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Credit Costs by Generation Type</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Generation Type</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Credits Required</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Cost per Unit</th>
                </tr>
              </thead>
              <tbody>
                {creditCosts.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-gray-300">{item.type}</td>
                    <td className="text-right py-3 px-4 text-purple-400 font-medium">
                      {item.cost} credits
                    </td>
                    <td className="text-right py-3 px-4 text-gray-400">
                      ${(item.cost * 0.08).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "How long do credits last?",
                a: "Credits expire after 7, 30, or 90 days depending on your plan. Unused credits are forfeited after expiration.",
              },
              {
                q: "Can I upgrade my plan?",
                a: "Yes, you can upgrade anytime. We'll prorate your billing based on your current plan.",
              },
              {
                q: "Is there a refund policy?",
                a: "Unused credits can be refunded within 7 days of purchase. Used credits are non-refundable.",
              },
              {
                q: "Do you offer bulk discounts?",
                a: "Yes! Pro plan includes 10% bulk discount, Enterprise includes 20%. Contact sales for custom pricing.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Ready to start creating?</p>
          <Button
            onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/login")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            {isAuthenticated ? "Go to Dashboard" : "Sign Up Free"}
          </Button>
        </div>
      </div>
    </div>
  );
}
