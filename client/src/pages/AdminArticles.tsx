import { useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Eye, Plus, Bold, Italic, Heading1, Heading2, Heading3, List, Link as LinkIcon, Image as ImageIcon, Quote } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

type View = "list" | "editor";

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  seo_title: string;
  seo_desc: string;
  is_published: boolean;
}

export default function AdminArticles() {
  const [view, setView] = useState<View>("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    seo_title: "",
    seo_desc: "",
    is_published: false,
  });

  // Queries and mutations
  const { data: articles, isLoading, refetch } = trpc.admin.articles.list.useQuery({ limit: 100 });
  const createMutation = trpc.admin.articles.create.useMutation();
  const deleteMutation = trpc.admin.articles.delete.useMutation();

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your article..." }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  // Handle save
  const handleSave = async (publish: boolean) => {
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Please fill in title, slug, and content");
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...formData,
        is_published: publish,
      });
      alert("Article saved successfully!");
      resetForm();
      setView("list");
      refetch();
    } catch (error) {
      alert("Failed to save article");
    }
  };

  // Handle delete
  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      await deleteMutation.mutateAsync({ slug });
      alert("Article deleted successfully!");
      refetch();
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  // Handle edit
  const handleEdit = (article: any) => {
    setEditingSlug(article.slug);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || "",
      cover_image: article.cover_image || "",
      seo_title: article.seo_title || "",
      seo_desc: article.seo_desc || "",
      is_published: article.is_published,
    });
    if (editor) {
      editor.commands.setContent(article.content);
    }
    setView("editor");
  };

  // Reset form
  const resetForm = () => {
    setEditingSlug(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      cover_image: "",
      seo_title: "",
      seo_desc: "",
      is_published: false,
    });
    if (editor) {
      editor.commands.setContent("");
    }
  };

  // Toolbar button helper
  const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-slate-700 rounded text-gray-300 hover:text-white transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  if (view === "editor") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">
              {editingSlug ? "Edit Article" : "Create New Article"}
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
                  <Input
                    placeholder="Article title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </CardContent>
              </Card>

              {/* Slug */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Slug</label>
                  <Input
                    placeholder="article-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Cover Image URL</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={formData.cover_image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  {formData.cover_image && (
                    <img src={formData.cover_image} alt="Cover preview" className="mt-4 max-h-48 rounded" />
                  )}
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Excerpt ({formData.excerpt.length}/160)
                  </label>
                  <Textarea
                    placeholder="Brief summary of the article"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        excerpt: e.target.value.slice(0, 160),
                      }))
                    }
                    className="bg-slate-900 border-slate-600 text-white h-24"
                  />
                </CardContent>
              </Card>

              {/* Editor */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Content</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-4 p-2 bg-slate-900 rounded border border-slate-600">
                    <ToolbarButton
                      icon={Bold}
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      title="Bold"
                    />
                    <ToolbarButton
                      icon={Italic}
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      title="Italic"
                    />
                    <div className="w-px bg-slate-600" />
                    <ToolbarButton
                      icon={Heading1}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      title="Heading 1"
                    />
                    <ToolbarButton
                      icon={Heading2}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      title="Heading 2"
                    />
                    <ToolbarButton
                      icon={Heading3}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      title="Heading 3"
                    />
                    <div className="w-px bg-slate-600" />
                    <ToolbarButton
                      icon={List}
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      title="Bullet List"
                    />
                    <ToolbarButton
                      icon={Quote}
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      title="Quote"
                    />
                    <div className="w-px bg-slate-600" />
                    <ToolbarButton
                      icon={LinkIcon}
                      onClick={() => {
                        const url = prompt("Enter URL:");
                        if (url) editor?.chain().focus().setLink({ href: url }).run();
                      }}
                      title="Link"
                    />
                    <ToolbarButton
                      icon={ImageIcon}
                      onClick={() => {
                        const url = prompt("Enter image URL:");
                        if (url) editor?.chain().focus().setImage({ src: url }).run();
                      }}
                      title="Image"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none bg-slate-900 rounded border border-slate-600 p-4 min-h-[400px]">
                    <EditorContent editor={editor} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* SEO */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">SEO Title</label>
                    <Input
                      placeholder="SEO title"
                      value={formData.seo_title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                      className="bg-slate-900 border-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">SEO Description</label>
                    <Textarea
                      placeholder="SEO description"
                      value={formData.seo_desc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, seo_desc: e.target.value }))}
                      className="bg-slate-900 border-slate-600 text-white text-sm h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 space-y-3">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={createMutation.isPending}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={createMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Publish
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Articles</h1>
          <Button
            onClick={() => {
              resetForm();
              setView("editor");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Articles ({articles?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading articles...</div>
            ) : articles && articles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Title</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article: any) => (
                      <tr key={article.slug} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{article.title}</p>
                            <p className="text-gray-500 text-xs">{article.slug}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              article.is_published
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }
                          >
                            {article.is_published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(article)}
                              className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(article.slug)}
                              className="p-2 hover:bg-slate-700 rounded text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No articles yet. Create your first one!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
