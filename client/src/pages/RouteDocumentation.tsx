import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Lock, Globe } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface RouteInfo {
  path: string;
  component: string;
  protection: "public" | "protected" | "admin";
  category: "dashboard" | "admin" | "public" | "auth";
  description: string;
}

const ROUTES: RouteInfo[] = [
  // Public routes
  { path: "/", component: "Home", protection: "public", category: "public", description: "Landing page" },
  { path: "/login", component: "Login", protection: "public", category: "auth", description: "User login" },
  { path: "/register", component: "Login", protection: "public", category: "auth", description: "User registration" },
  { path: "/pricing", component: "Pricing", protection: "public", category: "public", description: "Pricing page" },
  { path: "/affiliate", component: "Affiliate", protection: "public", category: "public", description: "Affiliate program info" },
  { path: "/blog", component: "Blog", protection: "public", category: "public", description: "Blog listing" },
  { path: "/blog/:slug", component: "Blog", protection: "public", category: "public", description: "Individual blog article" },
  { path: "/policy/:type", component: "PolicyPage", protection: "public", category: "public", description: "Legal policies (privacy, terms, etc)" },

  // Dashboard routes
  { path: "/dashboard", component: "Dashboard", protection: "protected", category: "dashboard", description: "User dashboard home" },
  { path: "/dashboard/credits", component: "CreditsPage", protection: "protected", category: "dashboard", description: "Credit management and purchase" },
  { path: "/dashboard/history", component: "HistoryPage", protection: "protected", category: "dashboard", description: "Generation history" },
  { path: "/dashboard/settings", component: "SettingsPage", protection: "protected", category: "dashboard", description: "User account settings" },
  { path: "/dashboard/generate-image", component: "GenerateImage", protection: "protected", category: "dashboard", description: "AI image generation" },
  { path: "/dashboard/generate-story", component: "GenerateStory", protection: "protected", category: "dashboard", description: "AI story generation" },
  { path: "/dashboard/generate-avatar", component: "GenerateAvatar", protection: "protected", category: "dashboard", description: "AI avatar generation" },
  { path: "/dashboard/generate-video", component: "GenerateVideo", protection: "protected", category: "dashboard", description: "AI video generation" },
  { path: "/dashboard/affiliate", component: "AffiliateDashboard", protection: "protected", category: "dashboard", description: "Affiliate dashboard" },
  { path: "/dashboard/remove-background", component: "RemoveBackground", protection: "protected", category: "dashboard", description: "Background removal tool" },
  { path: "/dashboard/batch-generation", component: "BatchGeneration", protection: "protected", category: "dashboard", description: "Batch content generation" },

  // Admin routes
  { path: "/admin", component: "AdminDashboard", protection: "admin", category: "admin", description: "Admin dashboard home" },
  { path: "/admin/analytics", component: "AnalyticsDashboard", protection: "admin", category: "admin", description: "Analytics and metrics" },
  { path: "/admin/moderation", component: "ContentModeration", protection: "admin", category: "admin", description: "Content moderation" },
  { path: "/admin/users", component: "AdminUsers", protection: "admin", category: "admin", description: "User management" },
  { path: "/admin/generations", component: "AdminGenerations", protection: "admin", category: "admin", description: "Generation management" },
  { path: "/admin/settings", component: "AdminSettings", protection: "admin", category: "admin", description: "Admin settings" },

  // Error handling
  { path: "/404", component: "NotFound", protection: "public", category: "public", description: "Page not found error" },
];

const PROTECTION_COLORS: Record<string, string> = {
  public: "bg-green-100 text-green-800",
  protected: "bg-blue-100 text-blue-800",
  admin: "bg-red-100 text-red-800",
};

const PROTECTION_ICONS: Record<string, React.ReactNode> = {
  public: <Globe className="w-4 h-4" />,
  protected: <Lock className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
};

export default function RouteDocumentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return ROUTES.filter((route) => {
      const matchesSearch =
        route.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || route.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const unique = new Set(ROUTES.map((r) => r.category));
    return Array.from(unique).sort();
  }, []);

  const stats = useMemo(() => {
    return {
      total: ROUTES.length,
      public: ROUTES.filter((r) => r.protection === "public").length,
      protected: ROUTES.filter((r) => r.protection === "protected").length,
      admin: ROUTES.filter((r) => r.protection === "admin").length,
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Route Documentation</h1>
          <p className="text-gray-400">Complete map of all application routes with protection levels and descriptions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Total Routes</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-900/30 border-green-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-green-400 text-sm mb-1">Public Routes</p>
                <p className="text-3xl font-bold text-green-300">{stats.public}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-400 text-sm mb-1">Protected Routes</p>
                <p className="text-3xl font-bold text-blue-300">{stats.protected}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-900/30 border-red-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-400 text-sm mb-1">Admin Routes</p>
                <p className="text-3xl font-bold text-red-300">{stats.admin}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search routes by path, component, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Routes ({filteredRoutes.length} of {ROUTES.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Path</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Component</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Protection</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="bg-slate-900 text-purple-300 px-2 py-1 rounded text-xs">
                            {route.path}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{route.component}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`${PROTECTION_COLORS[route.protection]} flex items-center gap-1 w-fit`}
                          >
                            {PROTECTION_ICONS[route.protection]}
                            <span className="capitalize">{route.protection}</span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-slate-700 text-gray-300 capitalize">
                            {route.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{route.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                        No routes match your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Protection Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">Public</p>
                  <p className="text-sm text-gray-400">Accessible to anyone without authentication</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">Protected</p>
                  <p className="text-sm text-gray-400">Requires user authentication to access</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">Admin</p>
                  <p className="text-sm text-gray-400">Restricted to admin users only</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
