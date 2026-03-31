import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: number;
  slug: string;
}

const articles: BlogArticle[] = [
  {
    id: "1",
    title: "How AI is Revolutionizing Content Creation",
    excerpt: "Discover how artificial intelligence is transforming the way creators produce content at scale.",
    content: "Full article content here...",
    author: "Sarah Chen",
    date: "2026-03-28",
    category: "AI Trends",
    image: "https://via.placeholder.com/600x400?text=AI+Content",
    readTime: 5,
    slug: "how-ai-revolutionizing-content",
  },
  {
    id: "2",
    title: "10 Tips for Creating Viral Images with AI",
    excerpt: "Learn the best practices for generating eye-catching images that get engagement.",
    content: "Full article content here...",
    author: "Mike Johnson",
    date: "2026-03-25",
    category: "Tips & Tricks",
    image: "https://via.placeholder.com/600x400?text=Viral+Images",
    readTime: 7,
    slug: "10-tips-viral-images",
  },
  {
    id: "3",
    title: "The Future of Video Generation",
    excerpt: "Explore the latest advancements in AI video generation and what's coming next.",
    content: "Full article content here...",
    author: "Emma Wilson",
    date: "2026-03-20",
    category: "Technology",
    image: "https://via.placeholder.com/600x400?text=Video+Generation",
    readTime: 8,
    slug: "future-video-generation",
  },
  {
    id: "4",
    title: "Maximizing Your Content ROI with AI Tools",
    excerpt: "Strategic guide to using AI tools to increase your content marketing ROI.",
    content: "Full article content here...",
    author: "David Lee",
    date: "2026-03-18",
    category: "Business",
    image: "https://via.placeholder.com/600x400?text=Content+ROI",
    readTime: 6,
    slug: "maximizing-content-roi",
  },
  {
    id: "5",
    title: "Understanding AI Image Styles and Prompts",
    excerpt: "Deep dive into different art styles and how to craft effective prompts.",
    content: "Full article content here...",
    author: "Lisa Zhang",
    date: "2026-03-15",
    category: "Tutorials",
    image: "https://via.placeholder.com/600x400?text=Image+Styles",
    readTime: 9,
    slug: "ai-image-styles-prompts",
  },
  {
    id: "6",
    title: "Case Study: From Zero to 100K Followers",
    excerpt: "Real story of how creators used AI to grow their audience exponentially.",
    content: "Full article content here...",
    author: "James Brown",
    date: "2026-03-12",
    category: "Case Studies",
    image: "https://via.placeholder.com/600x400?text=Growth+Story",
    readTime: 10,
    slug: "case-study-growth",
  },
];

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles = articles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

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
        </div>

        {/* Featured Article */}
        {filteredArticles.length > 0 && (
          <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 mb-16 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 md:h-auto">
                <img
                  src={filteredArticles[0]?.image || ""}
                  alt={filteredArticles[0]?.title || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                    {filteredArticles[0]?.category}
                  </span>
                  <span className="text-xs text-gray-400">Featured</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{filteredArticles[0]?.title}</h2>
                <p className="text-gray-400 mb-4">{filteredArticles[0]?.excerpt}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {filteredArticles[0]?.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {filteredArticles[0]?.date && new Date(filteredArticles[0].date).toLocaleDateString()}
                  </div>
                  <span>{filteredArticles[0]?.readTime} min read</span>
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
          {(filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles).map((article) => (
            <Card
              key={article.id}
              className="bg-slate-800 border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-colors cursor-pointer"
              onClick={() => setLocation(`/blog/${article.slug}`)}
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                />
              </div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-500/20 text-indigo-400">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">{article.readTime} min</span>
                </div>
                <CardTitle className="text-white text-lg line-clamp-2">{article.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.author}</span>
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
