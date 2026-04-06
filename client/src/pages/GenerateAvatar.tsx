import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, Loader2, Download, Zap, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const AVATAR_STYLES = [
  { id: "realistic", name: "Realistic", icon: "👤", description: "Photorealistic avatars" },
  { id: "anime", name: "Anime", icon: "✨", description: "Anime character style" },
  { id: "cartoon", name: "Cartoon", icon: "🎨", description: "Cartoon style" },
  { id: "3d", name: "3D", icon: "🎭", description: "3D rendered avatars" },
];

export default function GenerateAvatar() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);

  // Avatar customization sliders
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState("neutral");
  const [expression, setExpression] = useState(50);

  const { data: creditData } = trpc.credits.getBalance.useQuery();
  const generateMutation = trpc.generation.create.useMutation();

  const creditCost = useMemo(() => 5, []);
  const hasEnoughCredits = (creditData?.balance ?? 0) >= creditCost;
  const promptLength = prompt.trim().length;
  const isValidPrompt = promptLength >= 5 && promptLength <= 200;

  const handleGenerate = async () => {
    if (!isValidPrompt || !hasEnoughCredits) return;

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        type: "AVATAR",
        prompt: `${prompt} in ${selectedStyle} style, age ${age}, ${gender}, expression ${expression}`,
        quality: "standard" as const,
      });

      if (result.success) {
        if (result.outputUrl) {
          setGeneratedAvatarUrl(result.outputUrl);
          toast.success("Avatar generated successfully!");
        } else {
          toast.info("Avatar generation started. Check History for your avatar.");
        }
        setPrompt("");
      }
    } catch (error) {
      toast.error("Failed to generate avatar.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedAvatarUrl) {
      const link = document.createElement("a");
      link.href = generatedAvatarUrl;
      link.download = `avatar-${Date.now()}.png`;
      link.click();
      toast.success("Avatar downloaded!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Generate Avatars</h1>
          <p className="text-gray-400">Create unique AI-generated avatars for your profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Avatar Description</CardTitle>
                <CardDescription>Describe the avatar you want to create</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A professional business person with glasses..."
                  className="w-full h-24 bg-slate-900 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{promptLength}/200 characters</p>
                  <p className="text-xs text-gray-500">Min 5 characters required</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Avatar Style</CardTitle>
                <CardDescription>Choose the artistic style for your avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AVATAR_STYLES.map((style) => (
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
                <CardTitle className="text-white">Customization</CardTitle>
                <CardDescription>Fine-tune your avatar appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">Age: {age}</label>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["male", "neutral", "female"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          gender === g
                            ? "border-purple-500 bg-purple-500/20 text-white"
                            : "border-purple-500/20 bg-slate-900/50 text-gray-400 hover:border-purple-500/50"
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">Expression: {expression}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={expression}
                    onChange={(e) => setExpression(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
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
                      <p className="text-xs text-red-300 mt-1">
                        You need {creditCost - (creditData?.balance ?? 0)} more credits
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
                      Generate Avatar
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

            {generatedAvatarUrl && (
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Generated Avatar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-center aspect-square">
                    <img src={generatedAvatarUrl} alt="Generated Avatar" className="w-full h-full object-cover rounded" />
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Avatar
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <p>✓ Be specific about appearance</p>
                <p>✓ Mention clothing or accessories</p>
                <p>✓ Describe facial features clearly</p>
                <p>✓ Adjust expression for mood</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}