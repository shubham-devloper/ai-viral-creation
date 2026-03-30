import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, BookOpen, Loader2, Copy, Download } from "lucide-react";
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
      // Simulate API call - in production, call actual generation API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const storyExamples: Record<string, string> = {
        humorous:
          "Once upon a time, there was a programmer who tried to debug their code at 3 AM. They discovered that the bug was actually a feature. The end.",
        dramatic:
          "The storm clouds gathered above the ancient castle. She stood alone, facing her greatest fear. Everything she loved hung in the balance.",
        romantic:
          "Their eyes met across the crowded room. Time seemed to stop. In that moment, they both knew their lives would never be the same.",
        mysterious:
          "The letter arrived with no return address. Inside, a single clue that would change everything. But who sent it?",
        adventure:
          "The map led deep into the jungle. Danger lurked at every turn. But the treasure was worth any risk.",
        "sci-fi":
          "In the year 2150, humanity had finally reached the stars. But they were not alone. The first contact was about to begin.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">Story Generator</h1>
          </div>
          <p className="text-slate-400">Create unique stories with AI-powered storytelling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Story Prompt
                  </label>
                  <Textarea
                    placeholder="Describe the story you want to create... (minimum 10 characters)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    maxLength={500}
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    {promptLength}/500 characters
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Story Tone
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STORY_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedTone === tone.id
                            ? "border-purple-500 bg-purple-500/10 text-purple-300"
                            : "border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <span className="text-lg">{tone.emoji}</span>
                        <div>{tone.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Story Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STORY_LENGTHS.map((length) => (
                      <button
                        key={length.id}
                        onClick={() => setSelectedLength(length.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedLength === length.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-slate-600 bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <div className="font-medium text-white">{length.label}</div>
                        <div className="text-xs text-slate-400">{length.words} words</div>
                        <div className="text-xs text-purple-400">{length.credits} credits</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Credit Preview */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-slate-400">Credit Cost</div>
                      <div className="text-2xl font-bold text-purple-400">{creditCost}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Your Balance</div>
                      <div className="text-2xl font-bold text-white">{currentBalance}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">After Generation</div>
                      <div className={`text-2xl font-bold ${hasEnoughCredits ? "text-green-400" : "text-red-400"}`}>
                        {Math.max(0, currentBalance - creditCost)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {!isValidPrompt && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-400">
                      Prompt must be between 10 and 500 characters
                    </span>
                  </div>
                )}

                {!hasEnoughCredits && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-400">
                      Insufficient credits. You need {creditCost} credits but have {currentBalance}
                    </span>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!isValidPrompt || !hasEnoughCredits || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="font-semibold text-white mb-4">Tips for Better Stories</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>• Be specific about the setting and characters</li>
                <li>• Include emotions and conflicts</li>
                <li>• Mention the genre or theme</li>
                <li>• Add interesting plot twists</li>
                <li>• Specify the story length you prefer</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Generated Story Display */}
        {generatedStory && (
          <Card className="mt-8 bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Your Generated Story</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-6 text-slate-100 whitespace-pre-wrap leading-relaxed">
              {generatedStory}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
