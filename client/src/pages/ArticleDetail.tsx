import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, ArrowLeft, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
// useAuth is not needed, we'll use trpc.auth.me
import { Streamdown } from "streamdown";

export default function ArticleDetail() {
  const [, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug as string;
  const { data: user } = trpc.auth.me.useQuery();
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch article detail
  const { data: article, isLoading: articleLoading } = trpc.public.articles.detail.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch comments
  const { data: comments, refetch: refetchComments } = trpc.public.articles.comments.list.useQuery(
    { articleId: article?.id || 0 },
    { enabled: !!article?.id }
  );

  // Fetch related articles
  const { data: relatedArticles } = trpc.public.articles.related.useQuery(
    { articleId: article?.id || 0, limit: 3 },
    { enabled: !!article?.id }
  );

  // Create comment mutation
  const createCommentMutation = trpc.public.articles.comments.create.useMutation();

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !article || !user) return;

    setIsSubmittingComment(true);
    try {
      await createCommentMutation.mutateAsync({
        article_id: article.id,
        content: commentContent,
      });
      setCommentContent("");
      refetchComments();
      alert("Comment submitted! It will appear after moderation.");
    } catch (error) {
      alert("Failed to submit comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (articleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900/20 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900/20 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Button
            onClick={() => setLocation("/blog")}
            variant="outline"
            className="mb-8 border-slate-600 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400">Article not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          onClick={() => setLocation("/blog")}
          variant="outline"
          className="mb-8 border-slate-600 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <article className="mb-12">
          {/* Cover Image */}
          {article.cover_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {article.seo_title && (
                <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">{article.excerpt}</p>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <Streamdown>{article.content}</Streamdown>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related: any) => (
                <Card
                  key={related.slug}
                  className="bg-slate-800 border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/blog/${related.slug}`)}
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={related.cover_image || "https://via.placeholder.com/400x300?text=Article"}
                      alt={related.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-lg line-clamp-2">{related.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm line-clamp-2">{related.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t border-slate-700 pt-12">
          <h2 className="text-2xl font-bold text-white mb-8">Comments ({comments?.length || 0})</h2>

          {/* Comment Form */}
          {user ? (
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Leave a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts on this article..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    maxLength={1000}
                    className="bg-slate-900 border-slate-600 text-white min-h-24"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{commentContent.length}/1000</span>
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || isSubmittingComment}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-400 mb-4">Sign in to leave a comment</p>
                <Button
                  onClick={() => setLocation("/login")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <Card key={comment.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">Anonymous User</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
