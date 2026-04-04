import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Download, Zap, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const VIDEO_STYLES = [
  { id: "cinematic", name: "Cinematic", icon: "🎬", description: "Movie-like quality" },
  { id: "animation", name: "Animation", icon: "🎨", description: "Animated style" },
  { id: "documentary", name: "Documentary", icon: "📹", description: "Documentary feel" },
  { id: "music-video", name: "Music Video", icon: "🎵", description: "Music video style" },
];

const VIDEO_DURATIONS = [
  { id: "15s", label: "15 seconds", duration: "15s", credits: 15 },
  { id: "30s", label: "30 seconds", duration: "30s", credits: 25 },
  { id: "60s", label: "1 minute", duration: "60s", credits: 40 },
];

export default function GenerateVideo() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedDuration, setSelectedDuration] = useState("30s");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: creditData } = trpc.credits.getBalance.useQuery();
  const generateMutation = trpc.generation.create.useMutation();

  const creditCost = useMemo(() => {
    const duration = VIDEO_DURATIONS.find((d) => d.id === selectedDuration);
    return duration?.credits || 25;
  }, [selectedDuration]);

  const hasEnoughCredits = (creditData?.balance ?? 0) >= creditCost;
  const promptLength = prompt.trim().length;
  const isValidPrompt = promptLength >= 10 && promptLength <= 500;

  const handleGenerate = async () => {
    if (!isValidPrompt || !hasEnoughCredits) return;

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        type: "VIDEO",
        prompt: `${prompt} in ${selectedStyle} style`,
        quality: "standard" as const,
      });

      if (result.success) {
        toast.success("Video generation started!");
        setPrompt("");
      }
    } catch (error) {
      toast.error("Failed to generate video.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Generate Videos</h1>
          <p className="text-gray-400">Create stunning AI-generated videos from text descriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Prompt</CardTitle>
                <CardDescription>Describe the video you want to generate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A drone flying over a beautiful mountain landscape at sunset..."
                  className="w-full h-32 bg-slate-900 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{promptLength}/500 characters</p>
                  <p className="text-xs text-gray-500">Min 10 characters recommended</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Video Style</CardTitle>
                <CardDescription>Choose the style for your video</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VIDEO_STYLES.map((style) => (
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
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Video Duration</CardTitle>
                <CardDescription>Longer videos use more credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {VIDEO_DURATIONS.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedDuration === dur.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-900/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{dur.label}</p>
                        <span className="text-sm font-bold text-purple-400">{dur.credits} credits</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                    <span className={`font-semibold ${hasEnoughCredits ? "text-green-400" : "text-red-400"}`}>
                      {Math.max(0, (creditData?.balance ?? 0) - creditCost)}
                    </span>
                  </div>
                </div>

                {!hasEnoughCredits && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Insufficient Credits</p>
                      <p className="text-xs text-red-300 mt-1">You need {creditCost - (creditData?.balance ?? 0)} more</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !hasEnoughCredits || !isValidPrompt}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Video
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

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <p>✓ Describe camera movements and angles</p>
                <p>✓ Include lighting and atmosphere details</p>
                <p>✓ Mention transitions and effects</p>
                <p>✓ Specify music or sound style</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
