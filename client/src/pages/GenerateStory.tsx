import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, Loader2, Copy, Download, Zap, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const STORY_TONES = [
  { id: "humorous", label: "Humorous", emoji: "😂" },
  { id: "dramatic", label: "Dramatic", emoji: "🎭" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "mysterious", label: "Mysterious", emoji: "🔍" },
  { id: "adventure", label: "Adventure", emoji: "⚔️" },
  { id: "sci-fi", label: "Sci-Fi", emoji: "🚀" },
];

const STORY_LENGTHS = [
  { id: "short", label: "Short", words: "100-200", credits: 2 },
  { id: "medium", label: "Medium", words: "300-500", credits: 4 },
  { id: "long", label: "Long", words: "800-1200", credits: 6 },
];

export default function GenerateStory() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("dramatic");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: balanceData } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

  const currentBalance = balanceData?.balance ?? 0;

  const creditCost = useMemo(() => {
    const length = STORY_LENGTHS.find((l) => l.id === selectedLength);
    return length?.credits ?? 2;
  }, [selectedLength]);

  const hasEnoughCredits = currentBalance >= creditCost;
  const promptLength = prompt.trim().length;
  const isValidPrompt = promptLength >= 10 && promptLength <= 500;

  const handleGenerate = async () => {
    if (!isValidPrompt || !hasEnoughCredits) return;

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const storyExamples: Record<string, string> = {
        humorous: "Once upon a time, there was a programmer who tried to debug their code at 3 AM. They discovered that the bug was actually a feature. The end.",
        dramatic: "The storm clouds gathered above the ancient castle. She stood alone, facing her greatest fear. Everything she loved hung in the balance.",
        romantic: "Their eyes met across the crowded room. Time seemed to stop. In that moment, they both knew their lives would never be the same.",
        mysterious: "The letter arrived with no return address. Inside, a single clue that would change everything. But who sent it?",
        adventure: "The map led deep into the jungle. Danger lurked at every turn. But the treasure was worth any risk.",
        "sci-fi": "In the year 2150, humanity had finally reached the stars. But they were not alone. The first contact was about to begin.",
      };

      const story = storyExamples[selectedTone] || storyExamples.dramatic;
      setGeneratedStory(story);
      toast.success("Story generated successfully!");
    } catch (error) {
      toast.error("Failed to generate story. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedStory) {
      navigator.clipboard.writeText(generatedStory);
      toast.success("Story copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (generatedStory) {
      const element = document.createElement("a");
      const file = new Blob([generatedStory], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `story-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Story downloaded!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Generate Stories</h1>
          <p className="text-gray-400">Create unique stories with AI-powered storytelling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Prompt</CardTitle>
                <CardDescription>Describe the story you want to create</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A young wizard discovers a hidden portal in their school..."
                  className="w-full h-32 bg-slate-900 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{promptLength}/500 characters</p>
                  <p className="text-xs text-gray-500">Min 10 characters required</p>
                </div>
              </CardContent>
            </Card>

            {/* Tone Selection */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Story Tone</CardTitle>
                <CardDescription>Choose the mood and style of your story</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STORY_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedTone === tone.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-900/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="text-2xl mb-2">{tone.emoji}</div>
                      <p className="text-sm font-medium text-white">{tone.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Length Selection */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Story Length</CardTitle>
                <CardDescription>Longer stories use more credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STORY_LENGTHS.map((length) => (
                    <button
                      key={length.id}
                      onClick={() => setSelectedLength(length.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedLength === length.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-purple-500/20 bg-slate-900/50 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{length.label}</p>
                        <span className="text-sm font-bold text-purple-400">{length.credits} credits</span>
                      </div>
                      <p className="text-sm text-gray-400">{length.words} words</p>
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
                    <span className="text-white font-semibold">{currentBalance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">After generation:</span>
                    <span className={`font-semibold ${hasEnoughCredits ? "text-green-400" : "text-red-400"}`}>
                      {Math.max(0, currentBalance - creditCost)}
                    </span>
                  </div>
                </div>

                {!hasEnoughCredits && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Insufficient Credits</p>
                      <p className="text-xs text-red-300 mt-1">
                        You need {creditCost - currentBalance} more credits
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !hasEnoughCredits || !isValidPrompt}
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
                      Generate Story
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

            {/* Generated Story Display */}
            {generatedStory && (
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Generated Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-gray-300 text-sm leading-relaxed">{generatedStory}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <p>✓ Be specific about characters and setting</p>
                <p>✓ Include emotions and conflicts</p>
                <p>✓ Mention the genre or theme</p>
                <p>✓ Add interesting plot twists</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
