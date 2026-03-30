import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Zap, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function CreditsPage() {
  const { data: creditData } = trpc.credits.getBalance.useQuery();
  const { data: transactions } = trpc.credits.getTransactionHistory.useQuery({ limit: 50 });

  const creditPackages = [
    { name: "Starter", credits: 100, price: 99, savings: 0 },
    { name: "Popular", credits: 500, price: 449, savings: 51 },
    { name: "Pro", credits: 1000, price: 799, savings: 201 },
    { name: "Business", credits: 2500, price: 1799, savings: 701 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Credits</h1>
          <p className="text-gray-400">Manage your credits and purchase more</p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {creditData?.balance ?? 0}
                </div>
                <p className="text-gray-400">Credits available</p>
              </div>
              <Button className="ml-auto bg-purple-600 hover:bg-purple-700 mb-2">
                Scroll Down to Buy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Buy Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`border-purple-500/20 transition-all hover:border-purple-500/50 ${
                  pkg.name === "Popular"
                    ? "bg-gradient-to-br from-purple-500/20 to-purple-500/10 ring-2 ring-purple-500/30"
                    : "bg-slate-800/50"
                }`}
              >
                <CardHeader>
                  {pkg.name === "Popular" && (
                    <div className="mb-2 inline-block bg-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-white">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {pkg.credits}
                    </div>
                    <p className="text-sm text-gray-400">Credits</p>
                  </div>

                  <div className="border-t border-purple-500/10 pt-4">
                    <div className="text-2xl font-bold text-white mb-1">
                      ₹{pkg.price}
                    </div>
                    {pkg.savings > 0 && (
                      <p className="text-xs text-green-400">Save ₹{pkg.savings}</p>
                    )}
                  </div>

                  <Button
                    className={`w-full ${
                      pkg.name === "Popular"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    Buy Now
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    ₹{(pkg.price / pkg.credits).toFixed(2)} per credit
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
            <CardDescription>Your credit purchase and usage history</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === "PURCHASE"
                            ? "bg-green-500/20"
                            : tx.type === "REFUND"
                            ? "bg-red-500/20"
                            : "bg-blue-500/20"
                        }`}
                      >
                        {tx.type === "PURCHASE" ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-white font-medium capitalize">
                          {tx.type.toLowerCase()}
                          {tx.package_name && ` - ${tx.package_name}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "PURCHASE"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {tx.type === "PURCHASE" ? "+" : "-"}
                        {tx.credits_amount}
                      </p>
                      {tx.amount_inr && (
                        <p className="text-xs text-gray-400">₹{tx.amount_inr}</p>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          tx.status === "SUCCESS"
                            ? "text-green-400"
                            : tx.status === "FAILED"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Usage Info */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Credit Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-gray-300">Image Generation (Standard)</span>
                <span className="font-semibold text-purple-400">5 credits</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-gray-300">Image Generation (HD)</span>
                <span className="font-semibold text-purple-400">8 credits</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-gray-300">Video Generation (5 sec)</span>
                <span className="font-semibold text-purple-400">20 credits</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-gray-300">Story Generation</span>
                <span className="font-semibold text-purple-400">2 credits</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-gray-300">Avatar Generation</span>
                <span className="font-semibold text-purple-400">10 credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
