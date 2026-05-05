import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Zap, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);

  // Fetch all analytics data
  const trendsQuery = trpc.admin.analytics.trends.useQuery({ days });
  const revenueQuery = trpc.admin.analytics.revenue.useQuery({ days });
  const topUsersQuery = trpc.admin.analytics.topUsers.useQuery({ limit: 10 });
  const genStatsQuery = trpc.admin.analytics.generationStats.useQuery();
  const userStatsQuery = trpc.admin.analytics.userStats.useQuery();
  const creditMetricsQuery = trpc.admin.analytics.creditMetrics.useQuery();
  const affiliateMetricsQuery = trpc.admin.analytics.affiliateMetrics.useQuery();

  const isLoading =
    trendsQuery.isLoading ||
    revenueQuery.isLoading ||
    topUsersQuery.isLoading ||
    genStatsQuery.isLoading ||
    userStatsQuery.isLoading;

  // Format data for charts
  const trendData = (trendsQuery.data || []) as any[];
  const topUsersData = ((topUsersQuery.data || []) as any[]).map((u: any) => ({
    name: u.name || `User ${u.userId}`,
    generations: Number(u.generationCount) || 0,
    credits: Number(u.creditsUsed) || 0,
  }));

  const genStats = genStatsQuery.data as any;
  const userStats = userStatsQuery.data as any;
  const creditMetrics = creditMetricsQuery.data as any;
  const affiliateMetrics = affiliateMetricsQuery.data as any;
  const revenue = revenueQuery.data as any;

  // Prepare pie chart data
  const genTypeData: any[] = genStats?.byType
    ? Object.entries(genStats.byType).map(([type, count]: [string, any]) => ({
        name: type,
        value: Number(count) || 0,
      }))
    : [];

  const genStatusData: any[] = genStats?.byStatus
    ? Object.entries(genStats.byStatus).map(([status, count]: [string, any]) => ({
        name: status,
        value: Number(count) || 0,
      }))
    : [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-400">Track generation trends, revenue, and user engagement</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                days === d
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">{userStats?.total || 0}</p>
                  <p className="text-xs text-green-400 mt-2">
                    {userStats?.active || 0} active
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Generations</p>
                  <p className="text-3xl font-bold text-white">{genStats?.total || 0}</p>
                  <p className="text-xs text-purple-400 mt-2">
                    {days} day period
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ₹{Number(revenue?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-400 mt-2">
                    {revenue?.totalTransactions || 0} transactions
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Credits Available</p>
                  <p className="text-3xl font-bold text-white">
                    {Number(creditMetrics?.totalAvailable || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-400 mt-2">
                    {Number(creditMetrics?.totalUsed || 0).toLocaleString()} used
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Trends */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Generation Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Users by Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topUsersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="generations" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Generation by Type */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Generations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8b5cf6"
                    dataKey="value"
                  >
                    {genTypeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Generation by Status */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Generations by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8b5cf6"
                    dataKey="value"
                  >
                    {genStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Affiliate Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Affiliate Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Total Affiliates</p>
                <p className="text-2xl font-bold text-white">
                  {affiliateMetrics?.totalAffiliates || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Referrals</p>
                <p className="text-2xl font-bold text-white">
                  {affiliateMetrics?.totalReferrals || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Commissions</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{Number(affiliateMetrics?.totalCommissions || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{userStats?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-400">{userStats?.active || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Verified Users</p>
                <p className="text-2xl font-bold text-blue-400">{userStats?.verified || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Credit Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Credit System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Total Purchased</p>
                <p className="text-2xl font-bold text-white">
                  {Number(creditMetrics?.totalPurchased || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Used</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Number(creditMetrics?.totalUsed || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Available</p>
                <p className="text-2xl font-bold text-green-400">
                  {Number(creditMetrics?.totalAvailable || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  ₹{Number(revenue?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
                <p className="text-3xl font-bold text-white">
                  {revenue?.totalTransactions || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Transaction</p>
                <p className="text-3xl font-bold text-blue-400">
                  ₹{Number(revenue?.avgTransactionValue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
