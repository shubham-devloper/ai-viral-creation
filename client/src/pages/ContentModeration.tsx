import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, Eye, MessageSquare, Loader2, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FlaggedGeneration {
  id: number;
  user_id: number;
  type: string;
  prompt: string;
  output_url: string | null;
  is_flagged: boolean | null;
  flag_reason: string | null;
  createdAt: Date;
  user?: { name: string; email: string };
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function ContentModeration() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedGeneration, setSelectedGeneration] = useState<FlaggedGeneration | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch flagged generations
  const { data: flaggedGenerations = [], isLoading, refetch } = trpc.admin.getFlaggedGenerations.useQuery(
    { limit: 100 },
    { enabled: true }
  );

  // Mutations
  const approveMutation = trpc.admin.approveGeneration.useMutation();
  const rejectMutation = trpc.admin.rejectGeneration.useMutation();
  const warnUserMutation = trpc.admin.warnUser.useMutation();

  // Filter generations
  const filteredGenerations = useMemo(() => {
    if (filterStatus === "all") return flaggedGenerations;
    // In a real app, would filter by status from violations table
    return flaggedGenerations;
  }, [flaggedGenerations, filterStatus]);

  const handleApprove = async () => {
    if (!selectedGeneration) return;
    setIsProcessing(true);
    try {
      await approveMutation.mutateAsync({
        generationId: selectedGeneration.id,
        adminNotes,
      });
      toast.success("Generation approved");
      setSelectedGeneration(null);
      setAdminNotes("");
      refetch();
    } catch (error) {
      toast.error("Failed to approve generation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedGeneration) return;
    setIsProcessing(true);
    try {
      await rejectMutation.mutateAsync({
        generationId: selectedGeneration.id,
        reason: adminNotes || "Content violates community guidelines",
      });
      toast.success("Generation rejected");
      setSelectedGeneration(null);
      setAdminNotes("");
      refetch();
    } catch (error) {
      toast.error("Failed to reject generation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWarnUser = async () => {
    if (!selectedGeneration) return;
    setIsProcessing(true);
    try {
      await warnUserMutation.mutateAsync({
        userId: selectedGeneration.user_id,
        reason: adminNotes || "Content violation",
      });
      toast.success("User warned");
      setSelectedGeneration(null);
      setAdminNotes("");
      refetch();
    } catch (error) {
      toast.error("Failed to warn user");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
          </div>
          <p className="text-gray-400">Review and manage flagged user-generated content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-white">{flaggedGenerations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">User Warnings</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flagged Content List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Flagged Content</h2>
              <div className="flex gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      filterStatus === status
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : filteredGenerations.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-400">No flagged content to review</p>
                </CardContent>
              </Card>
            ) : (
              filteredGenerations.map((gen) => (
                <Card
                  key={gen.id}
                  className={`bg-slate-800/50 border cursor-pointer transition-colors ${
                    selectedGeneration?.id === gen.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedGeneration(gen)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {gen.output_url && (
                        <img
                          src={gen.output_url}
                          alt="Flagged content"
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-300">
                              {gen.type} • ID: {gen.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              User {gen.user_id}
                            </p>
                          </div>
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{gen.prompt}</p>
                        {gen.flag_reason && (
                          <p className="text-xs text-red-400 mt-2">Reason: {gen.flag_reason}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Review Panel */}
          <div className="space-y-4">
            {selectedGeneration ? (
              <>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Review Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedGeneration.output_url && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-2">Preview</p>
                        <img
                          src={selectedGeneration.output_url}
                          alt="Full preview"
                          className="w-full rounded-lg"
                        />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Prompt</p>
                      <p className="text-sm text-gray-300 bg-slate-900 p-2 rounded">
                        {selectedGeneration.prompt}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-2">Admin Notes</p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes for this review..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleWarnUser}
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/10"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Warn User
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <Eye className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Select a flagged item to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
