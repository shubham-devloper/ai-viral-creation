import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle, MoreVertical, Eye, Trash2, Ban } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface Generation {
  id: number;
  userId: number;
  userName: string;
  type: "IMAGE" | "STORY" | "AVATAR" | "VIDEO";
  prompt: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
  isFlagged: boolean;
  flagReason: string | null;
  createdAt: Date;
  outputUrl?: string;
}

export default function AdminGenerations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"all" | "flagged" | "completed">("all");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [actionDialog, setActionDialog] = useState<"approve" | "reject" | null>(null);

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  // Mock generations data
  const mockGenerations: Generation[] = [
    {
      id: 1,
      userId: 101,
      userName: "John Doe",
      type: "IMAGE",
      prompt: "A beautiful sunset over mountains",
      status: "COMPLETED",
      isFlagged: false,
      flagReason: null,
      createdAt: new Date("2026-03-30T10:30:00"),
      outputUrl: "https://via.placeholder.com/300x300?text=Sunset",
    },
    {
      id: 2,
      userId: 102,
      userName: "Jane Smith",
      type: "STORY",
      prompt: "A dark story about revenge",
      status: "COMPLETED",
      isFlagged: true,
      flagReason: "Potentially violent content",
      createdAt: new Date("2026-03-30T09:15:00"),
    },
    {
      id: 3,
      userId: 103,
      userName: "Bob Johnson",
      type: "AVATAR",
      prompt: "Professional business avatar",
      status: "COMPLETED",
      isFlagged: false,
      flagReason: null,
      createdAt: new Date("2026-03-30T08:45:00"),
      outputUrl: "https://via.placeholder.com/300x300?text=Avatar",
    },
    {
      id: 4,
      userId: 104,
      userName: "Alice Williams",
      type: "IMAGE",
      prompt: "Explicit adult content",
      status: "COMPLETED",
      isFlagged: true,
      flagReason: "Adult content - violates policy",
      createdAt: new Date("2026-03-29T16:20:00"),
    },
    {
      id: 5,
      userId: 105,
      userName: "Charlie Brown",
      type: "STORY",
      prompt: "A fantasy adventure story",
      status: "PROCESSING",
      isFlagged: false,
      flagReason: null,
      createdAt: new Date("2026-03-30T11:00:00"),
    },
  ];

  // Filter generations
  const filteredGenerations = useMemo(() => {
    let filtered = mockGenerations;

    if (statusFilter === "flagged") {
      filtered = filtered.filter((g) => g.isFlagged);
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((g) => g.status === "COMPLETED" && !g.isFlagged);
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [statusFilter]);

  const flaggedCount = mockGenerations.filter((g) => g.isFlagged).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-gray-400">Review and manage generated content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Total Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{mockGenerations.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{flaggedCount}</div>
              <p className="text-xs text-gray-400 mt-1">Pending review</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {mockGenerations.filter((g) => !g.isFlagged).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="completed">Approved</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Generations List */}
        <div className="space-y-4">
          {filteredGenerations.map((generation) => (
            <Card
              key={generation.id}
              className={`bg-slate-800 border-slate-700 ${
                generation.isFlagged ? "border-red-500/50" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {generation.outputUrl && (
                    <div className="w-24 h-24 rounded bg-slate-700 flex-shrink-0 overflow-hidden">
                      <img
                        src={generation.outputUrl}
                        alt={generation.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-white font-medium truncate">{generation.prompt}</h3>
                        <p className="text-sm text-gray-400">
                          by {generation.userName} • {generation.type}
                        </p>
                      </div>

                      {generation.isFlagged && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-500/20 border border-red-500/30 flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-red-400 font-medium">Flagged</span>
                        </div>
                      )}
                    </div>

                    {generation.isFlagged && generation.flagReason && (
                      <p className="text-sm text-red-400 mb-3">
                        <strong>Reason:</strong> {generation.flagReason}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {generation.createdAt.toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        {generation.outputUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600"
                            onClick={() => window.open(generation.outputUrl, "_blank")}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            {generation.isFlagged && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedGeneration(generation);
                                    setActionDialog("approve");
                                  }}
                                  className="cursor-pointer text-green-400 focus:text-green-400 focus:bg-green-500/10"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedGeneration(generation);
                                    setActionDialog("reject");
                                  }}
                                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Dialog */}
        <AlertDialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogTitle className="text-white">
              {actionDialog === "approve" ? "Approve Content?" : "Reject Content?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {actionDialog === "approve"
                ? "This content will be approved and made visible to the user."
                : "This content will be rejected and the user will be notified."}
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={
                  actionDialog === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {actionDialog === "approve" ? "Approve" : "Reject"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
