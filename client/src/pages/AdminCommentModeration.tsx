import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MessageSquare, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

export default function AdminCommentModeration() {
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch pending comments
  const { data: pendingComments, refetch } = trpc.admin.comments.pending.useQuery({ limit: 50 });

  // Mutations
  const approveMutation = trpc.admin.comments.approve.useMutation();
  const rejectMutation = trpc.admin.comments.reject.useMutation();

  // Handle approve
  const handleApprove = async (commentId: number) => {
    try {
      await approveMutation.mutateAsync({ commentId });
      refetch();
      setSelectedComment(null);
      alert("Comment approved!");
    } catch (error) {
      alert("Failed to approve comment");
    }
  };

  // Handle reject
  const handleReject = async (commentId: number) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectMutation.mutateAsync({ commentId, reason: rejectReason });
      refetch();
      setSelectedComment(null);
      setRejectReason("");
      alert("Comment rejected!");
    } catch (error) {
      alert("Failed to reject comment");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Comment Moderation</h1>
          <Badge className="bg-purple-600 text-white">
            {pendingComments?.length || 0} Pending
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Comments List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Comments</CardTitle>
              </CardHeader>
              <CardContent>
                {!pendingComments || pendingComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending comments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingComments.map((comment: any) => (
                      <div
                        key={comment.id}
                        onClick={() => setSelectedComment(comment)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedComment?.id === comment.id
                            ? "bg-slate-700 border-indigo-500"
                            : "bg-slate-900 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">
                              Article ID: {comment.article_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              User ID: {comment.user_id} • {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {comment.is_spam && (
                            <Badge className="bg-red-900 text-red-300">Spam</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comment Details & Actions */}
          <div>
            {selectedComment ? (
              <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Review Comment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Content
                    </label>
                    <div className="bg-slate-900 border border-slate-600 rounded p-3 text-gray-300 text-sm max-h-32 overflow-y-auto">
                      {selectedComment.content}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Article ID:</span>
                      <span className="text-white ml-2">{selectedComment.article_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white ml-2">{selectedComment.user_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Posted:</span>
                      <span className="text-white ml-2">
                        {new Date(selectedComment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <Textarea
                      placeholder="Explain why this comment is being rejected..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white h-20"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => handleApprove(selectedComment.id)}
                      disabled={approveMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedComment.id)}
                      disabled={rejectMutation.isPending || !rejectReason.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedComment(null);
                        setRejectReason("");
                      }}
                      variant="outline"
                      className="w-full border-slate-600 text-gray-400 hover:text-white"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-400">Select a comment to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
