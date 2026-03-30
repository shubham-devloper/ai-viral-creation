import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecentCreations from "@/components/RecentCreations";
import { trpc } from "@/lib/trpc";
import { Zap, TrendingUp, Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: creditData } = trpc.credits.getBalance.useQuery();
  const { data: generationHistory } = trpc.generation.getHistory.useQuery({ limit: 5 });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Manage your credits and AI content generation</p>
        </div>

        {/* Credits Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Credits */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Current Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {creditData?.balance ?? 0}
              </div>
              <p className="text-sm text-gray-400">Available for generation</p>
              <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Total Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {generationHistory?.length ?? 0}
              </div>
              <p className="text-sm text-gray-400">Content pieces created</p>
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 mb-2">Active</div>
              <p className="text-sm text-gray-400">Free tier user</p>
              <Button variant="outline" className="mt-4 w-full border-green-500/20 text-green-400 hover:bg-green-500/10">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Creations Gallery */}
        <div>
          <RecentCreations />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Start Creating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Generate AI images, videos, stories, or avatars</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Generate Content
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Earn Money</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Join our affiliate program and earn 30% commission</p>
              <Button variant="outline" className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
