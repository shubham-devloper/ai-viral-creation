import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Users, Loader2, Download, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const AVATAR_STYLES = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨" },
  { id: "realistic", label: "Realistic", emoji: "📸" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "pixel", label: "Pixel Art", emoji: "🎮" },
  { id: "3d", label: "3D", emoji: "🎭" },
];

const AVATAR_CHARACTERS = [
  { id: "hero", label: "Hero" },
  { id: "villain", label: "Villain" },
  { id: "wizard", label: "Wizard" },
  { id: "knight", label: "Knight" },
  { id: "pirate", label: "Pirate" },
  { id: "astronaut", label: "Astronaut" },
];

interface AvatarCustomizations {
  skinTone: number;
  hairLength: number;
  expressiveness: number;
  age: number;
}

export default function GenerateAvatar() {
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState("cartoon");
  const [selectedCharacter, setSelectedCharacter] = useState("hero");
  const [customizations, setCustomizations] = useState<AvatarCustomizations>({
    skinTone: 50,
    hairLength: 50,
    expressiveness: 50,
    age: 50,
  });
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: balanceData } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!user,
  });

  const currentBalance = balanceData?.balance ?? 0;
  const creditCost = 10;
  const hasEnoughCredits = currentBalance >= creditCost;

  const handleCustomizationChange = (key: keyof AvatarCustomizations, value: number) => {
    setCustomizations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerate = async () => {
    if (!hasEnoughCredits) return;

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate placeholder avatar URL with customizations
      const seed = Math.random();
      const styleColors: Record<string, string> = {
        cartoon: "ff6b9d",
        realistic: "667eea",
        anime: "f093fb",
        pixel: "00ff00",
        "3d": "ffd700",
      };

      const color = styleColors[selectedStyle] || "667eea";
      const avatarUrl = `https://via.placeholder.com/512x512/${color}/ffffff?text=${selectedCharacter}+Avatar`;
      setGeneratedAvatarUrl(avatarUrl);
      toast.success("Avatar generated successfully!");
    } catch (error) {
      toast.error("Failed to generate avatar. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedAvatarUrl) {
      const link = document.createElement("a");
      link.href = generatedAvatarUrl;
      link.download = `avatar-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Avatar downloaded!");
    }
  };

  const handleShare = () => {
    if (generatedAvatarUrl && navigator.share) {
      navigator.share({
        title: "Check out my AI Avatar!",
        text: `I created this awesome ${selectedStyle} ${selectedCharacter} avatar!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(generatedAvatarUrl || "");
      toast.success("Avatar URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">Avatar Creator</h1>
          </div>
          <p className="text-slate-400">Design your perfect AI-generated avatar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Style Selection */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Avatar Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedStyle === style.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-600 bg-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.emoji}</div>
                    <div className="text-xs font-medium text-slate-200">{style.label}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Character Selection */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Character Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVATAR_CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`p-3 rounded-lg border-2 transition-all font-medium ${
                      selectedCharacter === char.id
                        ? "border-purple-500 bg-purple-500/10 text-purple-300"
                        : "border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {char.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Customization Sliders */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Customization</h3>
              <div className="space-y-6">
                {/* Skin Tone */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">Skin Tone</label>
                    <span className="text-xs text-slate-400">{customizations.skinTone}%</span>
                  </div>
                  <Slider
                    value={[customizations.skinTone]}
                    onValueChange={(value) => handleCustomizationChange("skinTone", value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Hair Length */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">Hair Length</label>
                    <span className="text-xs text-slate-400">{customizations.hairLength}%</span>
                  </div>
                  <Slider
                    value={[customizations.hairLength]}
                    onValueChange={(value) => handleCustomizationChange("hairLength", value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Expressiveness */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">Expressiveness</label>
                    <span className="text-xs text-slate-400">{customizations.expressiveness}%</span>
                  </div>
                  <Slider
                    value={[customizations.expressiveness]}
                    onValueChange={(value) => handleCustomizationChange("expressiveness", value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Age */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-200">Age</label>
                    <span className="text-xs text-slate-400">{Math.round(customizations.age / 10) + 10} years</span>
                  </div>
                  <Slider
                    value={[customizations.age]}
                    onValueChange={(value) => handleCustomizationChange("age", value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Credit Preview & Generate */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Credit Cost</div>
                  <div className="text-3xl font-bold text-purple-400">{creditCost}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Your Balance</div>
                  <div className="text-3xl font-bold text-white">{currentBalance}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">After Generation</div>
                  <div className={`text-3xl font-bold ${hasEnoughCredits ? "text-green-400" : "text-red-400"}`}>
                    {Math.max(0, currentBalance - creditCost)}
                  </div>
                </div>
              </div>

              {!hasEnoughCredits && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-400">
                    Insufficient credits. You need {creditCost} credits but have {currentBalance}
                  </span>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!hasEnoughCredits || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Avatar...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Generate Avatar
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-slate-700 rounded-lg aspect-square flex items-center justify-center mb-4 overflow-hidden">
                {generatedAvatarUrl ? (
                  <img src={generatedAvatarUrl} alt="Generated Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Your avatar will appear here</p>
                  </div>
                )}
              </div>

              {generatedAvatarUrl && (
                <div className="space-y-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-slate-600 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full border-slate-600 hover:bg-slate-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-2">
                  <strong>Current Settings:</strong>
                </p>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>Style: {selectedStyle}</li>
                  <li>Character: {selectedCharacter}</li>
                  <li>Skin Tone: {customizations.skinTone}%</li>
                  <li>Hair: {customizations.hairLength}%</li>
                  <li>Expression: {customizations.expressiveness}%</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
