import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);

  // Fetch articles from tRPC
  const { data: articles, isLoading } = trpc.public.articles.list.useQuery({ limit: 50 });

  // Search articles if search term is provided
  const { data: searchResults } = trpc.public.articles.search.useQuery(
    { query: searchTerm, limit: 20 },
    { enabled: useAdvancedSearch && searchTerm.length > 0 }
  );

  // Extract unique categories
  const categories = useMemo(() => {
    if (!articles) return ["All"];
    const unique = Array.from(new Set(articles.map((a: any) => a.category || "Uncategorized")));
    return ["All", ...unique];
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    // Use search results if advanced search is active
    if (useAdvancedSearch && searchResults) {
      return searchResults;
    }

    if (!articles) return [];

    // Local filtering
    return articles
      .filter((article: any) => {
        const matchesSearch =
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || (article.category || "Uncategorized") === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [articles, searchTerm, selectedCategory, useAdvancedSearch, searchResults]);

  // Calculate read time (rough estimate: 200 words per minute)
  const getReadTime = (content: string) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900/20 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">AI Viral Blog</h1>
            <p className="text-xl text-gray-400">Tips, trends, and insights about AI-powered content creation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                <div className="h-40 bg-slate-700" />
                <CardHeader>
                  <div className="h-6 bg-slate-700 rounded mb-2" />
                  <div className="h-4 bg-slate-700 rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900/20 to-slate-900">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">AI Viral Blog</h1>
          <p className="text-xl text-gray-400">
            Tips, trends, and insights about AI-powered content creation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setUseAdvancedSearch(e.target.value.length > 0);
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setUseAdvancedSearch(false);
                }}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={
                  selectedCategory === category
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "border-slate-600 text-gray-400 hover:text-white"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Search Info */}
          {useAdvancedSearch && searchTerm && (
            <div className="text-sm text-gray-400">
              Found {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} for "{searchTerm}"
            </div>
          )}
        </div>

        {/* Featured Article */}
        {filteredArticles.length > 0 && (
          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 mb-16 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 md:h-auto">
                <img
                  src={filteredArticles[0]?.cover_image || "https://via.placeholder.com/600x400?text=Article"}
                  alt={filteredArticles[0]?.title || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                    Featured
                  </span>
                  {filteredArticles[0]?.is_published && (
                    <span className="text-xs text-green-400">Published</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{filteredArticles[0]?.title}</h2>
                <p className="text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {filteredArticles[0]?.createdAt && new Date(filteredArticles[0].createdAt).toLocaleDateString()}
                  </div>
                  <span>{getReadTime(filteredArticles[0]?.content || "")} min read</span>
                </div>

                <Button
                  onClick={() => filteredArticles[0] && setLocation(`/blog/${filteredArticles[0].slug}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles).map((article: any) => (
            <Card
              key={article.slug}
              className="bg-slate-800 border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-colors cursor-pointer"
              onClick={() => setLocation(`/blog/${article.slug}`)}
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={article.cover_image || "https://via.placeholder.com/600x400?text=Article"}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                />
              </div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-500/20 text-indigo-400">
                    {article.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">{getReadTime(article.content)} min</span>
                </div>
                <CardTitle className="text-white text-lg line-clamp-2">{article.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.slug}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchTerm ? `No articles found matching "${searchTerm}".` : "No articles available."}
            </p>
            {searchTerm && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setUseAdvancedSearch(false);
                }}
                variant="outline"
                className="mt-4 border-slate-600 text-gray-400 hover:text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
