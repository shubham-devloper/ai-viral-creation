import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Sparkles, Zap, Download, Share2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const IMAGE_STYLES = [
  { id: "realistic", name: "Realistic", icon: "🖼️", description: "Photorealistic images" },
  { id: "anime", name: "Anime", icon: "✨", description: "Anime art style" },
  { id: "oil-painting", name: "Oil Painting", icon: "🎨", description: "Classic oil painting" },
  { id: "watercolor", name: "Watercolor", icon: "💧", description: "Watercolor art" },
  { id: "digital-art", name: "Digital Art", icon: "🖌️", description: "Modern digital art" },
  { id: "cyberpunk", name: "Cyberpunk", icon: "🌐", description: "Cyberpunk aesthetic" },
  { id: "fantasy", name: "Fantasy", icon: "🐉", description: "Fantasy illustration" },
  { id: "minimalist", name: "Minimalist", icon: "⚫", description: "Minimalist design" },
];

const QUALITY_OPTIONS = [
  { id: "standard", name: "Standard", resolution: "512x512", creditCost: 5 },
  { id: "hd", name: "HD", resolution: "1024x1024", creditCost: 8 },
];

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { data: creditData } = trpc.credits.getBalance.useQuery();
  const generateMutation = trpc.generation.create.useMutation();

  // Calculate credit cost
  const creditCost = useMemo(() => {
    const quality = QUALITY_OPTIONS.find((q) => q.id === selectedQuality);
    return quality?.creditCost || 5;
  }, [selectedQuality]);

  // Check if user has enough credits
  const hasEnoughCredits = (creditData?.balance ?? 0) >= creditCost;

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!hasEnoughCredits) {
      toast.error(`Insufficient credits. You need ${creditCost} credits.`);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        type: "IMAGE",
        prompt: `${prompt} in ${selectedStyle} style`,
        quality: selectedQuality as "standard" | "hd",
      });

      if (result.success) {
        if (result.outputUrl) {
          setGeneratedImage(result.outputUrl);
          toast.success("Image generated successfully!");
        } else {
          toast.info("Image generation started. Check History for your image.");
        }
        setPrompt("");
        setSelectedStyle("realistic");
        setSelectedQuality("standard");
      }
    } catch (error) {
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `ai-viral-${Date.now()}.png`;
      link.click();
      toast.success("Image downloaded!");
    }
  };

  const handleShare = () => {
    if (generatedImage) {
      navigator.share?.({
        title: "AI Viral Creation",
        text: `Check out this AI-generated image: ${prompt}`,
        url: generatedImage,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Generate Images</h1>
          <p className="text-gray-400">Create stunning AI-generated images from text descriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Prompt</CardTitle>
                <CardDescription>Describe the image you want to generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A serene mountain landscape at sunset with snow-capped peaks..."
                  className="w-full h-32 bg-slate-900 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{prompt.length} characters</p>
                  <p className="text-xs text-gray-500">Min 10 characters recommended</p>
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Art Style</CardTitle>
                <CardDescription>Choose the artistic style for your image</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedStyle === style.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-900/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <p className="text-sm font-medium text-white">{style.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{style.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Selection */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Image Quality</CardTitle>
                <CardDescription>Higher quality uses more credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUALITY_OPTIONS.map((quality) => (
                    <button
                      key={quality.id}
                      onClick={() => setSelectedQuality(quality.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedQuality === quality.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-900/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{quality.name}</p>
                        <span className="text-sm font-bold text-purple-400">
                          {quality.creditCost} credits
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{quality.resolution} resolution</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Credits */}
          <div className="space-y-6">
            {/* Credit Cost Preview */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Credit Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Cost for this generation:</p>
                  <div className="text-4xl font-bold text-purple-400 mb-4">{creditCost}</div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Your balance:</span>
                    <span className="text-white font-semibold">{creditData?.balance ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">After generation:</span>
                    <span
                      className={`font-semibold ${
                        hasEnoughCredits ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {Math.max(0, (creditData?.balance ?? 0) - creditCost)}
                    </span>
                  </div>
                </div>

                {!hasEnoughCredits && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Insufficient Credits</p>
                      <p className="text-xs text-red-300 mt-1">
                        You need {creditCost - (creditData?.balance ?? 0)} more credits
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !hasEnoughCredits || !prompt.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                  asChild
                >
                  <a href="/dashboard/credits">Buy Credits</a>
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <p>✓ Be specific and detailed in your prompt</p>
                <p>✓ Mention lighting, mood, and atmosphere</p>
                <p>✓ Include art style or artist references</p>
                <p>✓ Specify composition and perspective</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Image Preview */}
        {generatedImage && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-square">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Your Prompt:</p>
                <p className="text-white">{prompt}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Prompts */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Example Prompts</CardTitle>
            <CardDescription>Get inspired by these prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "A futuristic city at night with neon lights reflecting on wet streets",
                "A cozy cabin in the snowy mountains with warm fireplace glow",
                "An underwater coral reef with colorful tropical fish swimming",
                "A steampunk airship flying through clouds at sunset",
              ].map((examplePrompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(examplePrompt)}
                  className="p-3 bg-slate-900/50 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition text-left"
                >
                  <p className="text-sm text-gray-300">{examplePrompt}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
