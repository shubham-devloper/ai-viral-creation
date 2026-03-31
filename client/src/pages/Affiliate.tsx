import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Users, DollarSign, Gift, Copy, Check } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Affiliate() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [referrals, setReferrals] = useState(10);
  const [conversionRate, setConversionRate] = useState(25);
  const [avgOrderValue, setAvgOrderValue] = useState(39.99);
  const [copiedCode, setCopiedCode] = useState(false);

  const commissionRate = 0.3; // 30% commission
  const conversions = Math.floor(referrals * (conversionRate / 100));
  const totalRevenue = conversions * avgOrderValue;
  const earnings = totalRevenue * commissionRate;

  const handleCopyCode = () => {
    navigator.clipboard.writeText("VIRAL2024");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-900/20 to-slate-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Join Our Affiliate Program
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Earn 30% commission on every referral. No limits, no caps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/login")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
            >
              {isAuthenticated ? "Go to Dashboard" : "Join Now"}
            </Button>
            <Button
              variant="outline"
              className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              onClick={() => setLocation("/policy/affiliate")}
            >
              View Terms
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <DollarSign className="w-6 h-6" />, title: "30% Commission", desc: "On every referral" },
            { icon: <TrendingUp className="w-6 h-6" />, title: "Unlimited Earnings", desc: "No caps or limits" },
            { icon: <Users className="w-6 h-6" />, title: "Easy Sharing", desc: "Unique referral links" },
            { icon: <Gift className="w-6 h-6" />, title: "Bonus Rewards", desc: "Reach milestones" },
          ].map((benefit, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700 text-center">
              <CardContent className="pt-6">
                <div className="text-cyan-400 mb-3 flex justify-center">{benefit.icon}</div>
                <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calculator */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 mb-16">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Earnings Calculator
            </CardTitle>
            <CardDescription>See how much you could earn</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Referrals Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-medium">Monthly Referrals</label>
                <span className="text-2xl font-bold text-cyan-400">{referrals}</span>
              </div>
              <Slider
                value={[referrals]}
                onValueChange={(value) => setReferrals(value[0])}
                min={1}
                max={1000}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-2">Adjust to see potential earnings</p>
            </div>

            {/* Conversion Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-medium">Conversion Rate</label>
                <span className="text-2xl font-bold text-cyan-400">{conversionRate}%</span>
              </div>
              <Slider
                value={[conversionRate]}
                onValueChange={(value) => setConversionRate(value[0])}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-2">Industry average is 20-30%</p>
            </div>

            {/* Average Order Value */}
            <div>
              <label className="text-white font-medium block mb-2">Average Order Value</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">$</span>
                <Input
                  type="number"
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(parseFloat(e.target.value) || 0)}
                  className="bg-slate-700 border-slate-600 text-white"
                  step="0.01"
                />
              </div>
            </div>

            {/* Results */}
            <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 border border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Conversions</p>
                  <p className="text-2xl font-bold text-cyan-400">{conversions}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Your Earnings</p>
                  <p className="text-2xl font-bold text-green-400">${earnings.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Based on 30% commission rate and {conversionRate}% conversion rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Join the affiliate program and get your unique referral link",
              },
              {
                step: "2",
                title: "Share",
                desc: "Share your link on social media, blogs, or with your audience",
              },
              {
                step: "3",
                title: "Earn",
                desc: "Get 30% commission on every purchase from your referral",
              },
              {
                step: "4",
                title: "Withdraw",
                desc: "Withdraw earnings monthly via bank transfer or crypto",
              },
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Referral Code */}
        <Card className="bg-slate-800 border-slate-700 mb-16">
          <CardHeader>
            <CardTitle className="text-white">Your Referral Code</CardTitle>
            <CardDescription>Share this code with your audience</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2">
              <Input
                value="VIRAL2024"
                readOnly
                className="bg-slate-700 border-slate-600 text-white font-mono text-lg"
              />
              <Button
                onClick={handleCopyCode}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Share VIRAL2024 to get 30% commission on all referrals
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/login")}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Earning Today
          </Button>
        </div>
      </div>
    </div>
  );
}
