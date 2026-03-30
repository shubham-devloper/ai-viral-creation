import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Image, Video, BookOpen, User2, Download, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

const typeIcons: Record<string, any> = {
  IMAGE: Image,
  VIDEO: Video,
  STORY: BookOpen,
  AVATAR: User2,
};

const typeColors: Record<string, string> = {
  IMAGE: "bg-blue-500/20 text-blue-400",
  VIDEO: "bg-red-500/20 text-red-400",
  STORY: "bg-green-500/20 text-green-400",
  AVATAR: "bg-purple-500/20 text-purple-400",
};

export default function HistoryPage() {
  const { data: generations, isLoading } = trpc.generation.getHistory.useQuery({ limit: 100 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-400";
      case "PROCESSING":
        return "text-yellow-400";
      case "FAILED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Generation History</h1>
          <p className="text-gray-400">View all your AI-generated content</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
            All
          </Button>
          <Button variant="outline" className="border-purple-500/20 text-gray-400 hover:bg-slate-800">
            Images
          </Button>
          <Button variant="outline" className="border-purple-500/20 text-gray-400 hover:bg-slate-800">
            Videos
          </Button>
          <Button variant="outline" className="border-purple-500/20 text-gray-400 hover:bg-slate-800">
            Stories
          </Button>
          <Button variant="outline" className="border-purple-500/20 text-gray-400 hover:bg-slate-800">
            Avatars
          </Button>
        </div>

        {/* Generations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            <p className="text-gray-400 mt-4">Loading your generations...</p>
          </div>
        ) : generations && generations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen: any) => {
              const Icon = typeIcons[gen.type];
              return (
                <Card
                  key={gen.id}
                  className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition overflow-hidden"
                >
                  {/* Thumbnail */}
                  {gen.output_url ? (
                    <div className="relative h-40 bg-slate-900 overflow-hidden">
                      <img
                        src={gen.output_url}
                        alt={gen.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 hover:opacity-100 transition flex items-end justify-center pb-4">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-slate-900 flex items-center justify-center">
                      <div className={`p-4 rounded-lg ${typeColors[gen.type]}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    {/* Type and Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColors[gen.type]}`}>
                        {gen.type}
                      </span>
                      <span className={`text-xs font-semibold ${getStatusColor(gen.status)}`}>
                        {gen.status}
                      </span>
                    </div>

                    {/* Prompt */}
                    <div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {gen.prompt}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{gen.credits_used} credits</span>
                      <span>{format(new Date(gen.createdAt), "MMM d, yyyy")}</span>
                    </div>

                    {/* Quality Badge */}
                    {gen.quality && (
                      <div className="text-xs">
                        <span className="bg-slate-700 text-gray-300 px-2 py-1 rounded capitalize">
                          {gen.quality} Quality
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {gen.status === "COMPLETED" && (
                      <div className="flex gap-2 pt-2 border-t border-purple-500/10">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No generations yet</h3>
              <p className="text-gray-400 mb-6">
                Start creating AI content to see your history here
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create Your First Generation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
