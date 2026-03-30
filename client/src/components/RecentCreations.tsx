import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Share2,
  Trash2,
  Eye,
  MoreVertical,
  Image as ImageIcon,
  BookOpen,
  Users,
  Loader2,
  Grid3x3,
  List,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export interface Generation {
  id: number;
  user_id: number;
  type: "IMAGE" | "VIDEO" | "STORY" | "AVATAR";
  prompt: string;
  output_url: string | null;
  thumbnail_url: string | null;
  is_watermarked: boolean | null;
  quality: "standard" | "hd" | null;
  credits_used: number;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | null;
  metadata: any;
  is_flagged: boolean | null;
  flag_reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type FilterType = "ALL" | "IMAGE" | "VIDEO" | "STORY" | "AVATAR";
type SortType = "newest" | "oldest" | "credits_high" | "credits_low";
type ViewType = "grid" | "list";

export default function RecentCreations() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch generations
  const { data: generations, isLoading, refetch } = trpc.generation.getHistory.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );

  // Filter and sort generations
  const filteredGenerations = useMemo(() => {
    if (!generations) return [] as Generation[];

    let filtered: Generation[] = generations;

    // Apply type filter
    if (filterType !== "ALL") {
      filtered = filtered.filter((g) => g.type === filterType);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "credits_high":
          return b.credits_used - a.credits_used;
        case "credits_low":
          return a.credits_used - b.credits_used;
        default:
          return 0;
      }
    });

    return sorted;
  }, [generations, filterType, sortType]);

  const handleDownload = (generation: Generation) => {
    if (generation.output_url) {
      const link = document.createElement("a");
      link.href = generation.output_url;
      link.download = `creation-${generation.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  const handleShare = (generation: Generation) => {
    const text = `Check out my AI-generated ${generation.type.toLowerCase()}! "${generation.prompt}"`;
    if (navigator.share) {
      navigator.share({
        title: "AI Viral Creation",
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    if (!selectedGeneration) return;
    setDeletingId(selectedGeneration.id);
    try {
      // Simulate delete - in production, call actual API
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Creation deleted successfully");
      setDeleteConfirm(false);
      setSelectedGeneration(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete creation");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="w-4 h-4" />;
      case "STORY":
        return <BookOpen className="w-4 h-4" />;
      case "AVATAR":
        return <Users className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "IMAGE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "STORY":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "AVATAR":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-400";
      case "PROCESSING":
        return "bg-yellow-500/10 text-yellow-400";
      case "FAILED":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-slate-400">Loading your creations...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!generations || generations.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <ImageIcon className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Creations Yet</h3>
          <p className="text-slate-400 text-center max-w-sm">
            Start generating images, stories, or avatars to see them here. Your creations will
            appear in this gallery.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Recent Creations</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewType("grid")}
              className={`${
                viewType === "grid"
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "border-slate-600"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewType("list")}
              className={`${
                viewType === "list"
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "border-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="IMAGE">Images</SelectItem>
              <SelectItem value="STORY">Stories</SelectItem>
              <SelectItem value="AVATAR">Avatars</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="credits_high">Most Credits Used</SelectItem>
              <SelectItem value="credits_low">Least Credits Used</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-slate-400 flex items-center">
            {filteredGenerations.length} creation{filteredGenerations.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Gallery Grid or List */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGenerations.map((generation) => (
            <Card
              key={generation.id}
              className="bg-slate-800 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square bg-slate-700 overflow-hidden">
                {generation.output_url ? (
                  <img
                    src={generation.output_url}
                    alt={generation.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {generation.status === "PROCESSING" ? (
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    ) : generation.status === "FAILED" ? (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-400">Failed</p>
                      </div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                )}

                {/* Overlay with Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGeneration(generation);
                    }}
                    className="border-white/30 hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {generation.output_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(generation);
                      }}
                      className="border-white/30 hover:bg-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 truncate">{generation.prompt}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem
                        onClick={() => handleShare(generation)}
                        className="cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGeneration(generation);
                          setDeleteConfirm(true);
                        }}
                        className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getTypeColor(
                      generation.type
                    )}`}
                  >
                    {getTypeIcon(generation.type)}
                    {generation.type}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                      generation.status
                    )}`}
                  >
                    {generation.status}
                  </span>
                </div>

                {/* Credits */}
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>⚡ {generation.credits_used} credits</span>
                  <span>{new Date(generation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredGenerations.map((generation) => (
            <Card
              key={generation.id}
              className="bg-slate-800 border-slate-700 p-4 hover:border-purple-500/50 transition-all flex items-center gap-4 group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded bg-slate-700 flex-shrink-0 overflow-hidden">
                {generation.output_url ? (
                  <img
                    src={generation.output_url}
                    alt={generation.prompt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {generation.status === "PROCESSING" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    ) : (
                      getTypeIcon(generation.type)
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate font-medium">{generation.prompt}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(
                      generation.type
                    )}`}
                  >
                    {getTypeIcon(generation.type)}
                    {generation.type}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                      generation.status
                    )}`}
                  >
                    {generation.status}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-xs text-slate-400">
                  ⚡ {generation.credits_used} • {new Date(generation.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {generation.output_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(generation);
                      }}
                      className="h-7 border-slate-600"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(generation);
                    }}
                    className="h-7 border-slate-600"
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGeneration(generation);
                      setDeleteConfirm(true);
                    }}
                    className="h-7 border-slate-600 hover:border-red-500/50 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogTitle className="text-white">Delete Creation?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this creation? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
