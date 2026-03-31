import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  // Mock data for charts
  const dailyGenerations = [
    { date: "Mon", images: 1200, stories: 800, avatars: 600 },
    { date: "Tue", images: 1900, stories: 1200, avatars: 900 },
    { date: "Wed", images: 1600, stories: 1000, avatars: 700 },
    { date: "Thu", images: 2100, stories: 1400, avatars: 1100 },
    { date: "Fri", images: 2400, stories: 1600, avatars: 1200 },
    { date: "Sat", images: 2200, stories: 1500, avatars: 1000 },
    { date: "Sun", images: 1800, stories: 1200, avatars: 800 },
  ];

  const creditDistribution = [
    { name: "Free Users", value: 45, color: "#8b5cf6" },
    { name: "Premium Users", value: 35, color: "#06b6d4" },
    { name: "Enterprise", value: 20, color: "#ec4899" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 12000, users: 450 },
    { month: "Feb", revenue: 19000, users: 620 },
    { month: "Mar", revenue: 16000, users: 580 },
    { month: "Apr", revenue: 21000, users: 750 },
    { month: "May", revenue: 24000, users: 890 },
    { month: "Jun", revenue: 22000, users: 920 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and management tools</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Users className="w-5 h-5 text-blue-400" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">12,458</div>
              <p className="text-xs text-gray-400 mt-1">+2.5% from last month</p>
            </CardContent>
          </Card>

          {/* Total Generations */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Zap className="w-5 h-5 text-purple-400" />
                Total Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">2,847,392</div>
              <p className="text-xs text-gray-400 mt-1">+12.3% from last month</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <DollarSign className="w-5 h-5 text-green-400" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">$84,250</div>
              <p className="text-xs text-gray-400 mt-1">+8.7% from last month</p>
            </CardContent>
          </Card>

          {/* Flagged Content */}
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Flagged Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">47</div>
              <p className="text-xs text-gray-400 mt-1">Pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Generations Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Daily Generations
              </CardTitle>
              <CardDescription>Content generation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyGenerations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Bar dataKey="images" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="stories" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="avatars" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                User Distribution
              </CardTitle>
              <CardDescription>By subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChartComponent>
                  <Pie
                    data={creditDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {creditDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Growth */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenue & User Growth
            </CardTitle>
            <CardDescription>Monthly trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Manage users, roles, and permissions</p>
              <Button
                onClick={() => setLocation("/admin/users")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Review flagged content and manage policies</p>
              <Button
                onClick={() => setLocation("/admin/generations")}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Review Content
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Credits Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Manage credit packages and pricing</p>
              <Button
                onClick={() => setLocation("/admin/credits")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Manage Credits
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">View and manage all transactions</p>
              <Button
                onClick={() => setLocation("/admin/transactions")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View Transactions
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Affiliate Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Manage affiliates and payouts</p>
              <Button
                onClick={() => setLocation("/admin/affiliates")}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                Manage Affiliates
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Content Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Edit articles, policies, and pages</p>
              <Button
                onClick={() => setLocation("/admin/content")}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
