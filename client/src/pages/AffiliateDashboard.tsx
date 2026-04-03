import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Copy, Check, Users, TrendingUp, DollarSign, Wallet, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateDashboard() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("500");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Fetch affiliate data
  const { data: codeData, isLoading: codeLoading, error: codeError } = trpc.affiliate.getCode.useQuery();
  const { data: statsData, isLoading: statsLoading, error: statsError } = trpc.affiliate.getStats.useQuery();
  const payoutMutation = trpc.affiliate.requestPayout.useMutation();

  // Generate shareable link
  const affiliateLink = codeData?.code
    ? `${window.location.origin}?ref=${codeData.code}`
    : "";

  const handleCopyCode = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopiedCode(true);
      toast.success("Affiliate code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      setCopiedLink(true);
      toast.success("Affiliate link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (isNaN(amount) || amount < 500) {
      toast.error("Minimum payout amount is ₹500");
      return;
    }

    if (statsData && amount > statsData.pending) {
      toast.error(`You have ₹${statsData.pending.toFixed(2)} pending. Cannot request ₹${amount.toFixed(2)}.`);
      return;
    }

    setIsSubmittingPayout(true);
    try {
      await payoutMutation.mutateAsync({ amount });
      toast.success("Payout request submitted. You will receive it within 5-7 business days.");
      setPayoutAmount("500");
    } catch (error: any) {
      toast.error(error.message || "Failed to request payout");
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Loading state
  if (codeLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="h-40 bg-slate-700 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (codeError || statsError) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
            <p className="text-gray-400">Manage your affiliate earnings and referrals</p>
          </div>

          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <p className="text-red-400">
                {codeError?.message || statsError?.message || "Failed to load affiliate data. Please join the affiliate program first."}
              </p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                Join Affiliate Program
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-400">Manage your affiliate earnings and referrals</p>
        </div>

        {/* Affiliate Code & Link Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Affiliate Code */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Your Affiliate Code</CardTitle>
              <CardDescription>Share this code with your audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={codeData?.code || ""}
                  readOnly
                  className="bg-slate-800 border-slate-700 text-white font-mono text-lg tracking-widest"
                />
                <Button
                  onClick={handleCopyCode}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Created on {codeData?.createdAt ? new Date(codeData.createdAt).toLocaleDateString() : "N/A"}</p>
            </CardContent>
          </Card>

          {/* Shareable Link */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white">Shareable Link</CardTitle>
              <CardDescription>Direct referral link for sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={affiliateLink}
                  readOnly
                  className="bg-slate-800 border-slate-700 text-white text-sm truncate"
                />
                <Button
                  onClick={handleCopyLink}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Share this link to earn commissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Referrals */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{statsData?.referrals ?? 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active referrals</p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">₹{(statsData?.earned ?? 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          {/* Pending Payout */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-yellow-400" />
                Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">₹{(statsData?.pending ?? 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          {/* Paid Out */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">₹{(statsData?.paidOut ?? 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Already withdrawn</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
            <CardDescription>Simple 3-step process to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: "Share Your Link",
                  description: "Share your unique affiliate link or code with your audience on social media, blogs, or newsletters.",
                },
                {
                  step: 2,
                  title: "They Sign Up",
                  description: "When someone clicks your link and signs up for AI Viral Creation, they're attributed to your account.",
                },
                {
                  step: 3,
                  title: "Earn Commission",
                  description: "Earn 30% commission on every purchase they make. Commissions are credited to your account instantly.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600">
                      <span className="text-white font-semibold">{item.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                  {item.step < 3 && (
                    <div className="flex-shrink-0 hidden sm:block">
                      <ArrowRight className="w-5 h-5 text-purple-400 mt-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Request Section */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Request Payout</CardTitle>
            <CardDescription>Withdraw your pending earnings (minimum ₹500)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Amount to Withdraw (₹)</label>
              <Input
                type="number"
                min="500"
                max={statsData?.pending ?? 0}
                step="100"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="500"
              />
              <p className="text-xs text-gray-500">
                Available: ₹{(statsData?.pending ?? 0).toFixed(2)} | Minimum: ₹500
              </p>
            </div>

            <Button
              onClick={handleRequestPayout}
              disabled={
                isSubmittingPayout ||
                !statsData ||
                statsData.pending < 500 ||
                parseFloat(payoutAmount) < 500
              }
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingPayout ? "Processing..." : "Request Payout"}
            </Button>

            {statsData && statsData.pending < 500 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                <p className="text-sm text-yellow-400">
                  You need ₹{(500 - statsData.pending).toFixed(2)} more to request a payout.
                </p>
              </div>
            )}

            <div className="bg-slate-700/50 rounded p-3 space-y-2">
              <p className="text-xs text-gray-400 font-semibold">Payout Information:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Payouts are processed within 5-7 business days</li>
                <li>• Minimum payout amount is ₹500</li>
                <li>• Payments are made via bank transfer</li>
                <li>• Commission rate: 30% on all referral purchases</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Tips to Maximize Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Share your link on social media platforms where your audience is most active</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Create content showcasing AI Viral Creation features and results</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Include your referral link in email newsletters and blog posts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Engage with your audience and answer questions about the platform</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400">•</span>
                <span>Track your referrals and optimize your marketing strategy</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
