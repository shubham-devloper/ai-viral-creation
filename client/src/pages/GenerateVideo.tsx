import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Zap, Lock, Clock, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function GenerateVideo() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("15");
  const [style, setStyle] = useState("cinematic");
  const [loading, setLoading] = useState(false);

  const { data: credits } = trpc.credits.getBalance.useQuery();
  const { data: subscription } = trpc.profile.get.useQuery();

  const plan = (subscription as any)?.plan ?? "FREE";
  const isFreePlan = plan === "FREE";
  const videoCost = 30;
  const hasEnoughCredits = (credits?.balance ?? 0) >= videoCost;

  const styles = [
    { id: "cinematic", label: "Cinematic", description: "Professional film quality" },
    { id: "animated", label: "Animated", description: "Cartoon style animation" },
    { id: "documentary", label: "Documentary", description: "Realistic documentary" },
    { id: "abstract", label: "Abstract", description: "Modern abstract visuals" },
  ];

  const durations = [
    { value: "15", label: "15 seconds" },
    { value: "30", label: "30 seconds" },
    { value: "60", label: "1 minute" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (isFreePlan) {
      alert("Video generation requires a paid plan. Please upgrade to continue.");
      return;
    }

    if (!hasEnoughCredits) {
      alert(`Insufficient credits. You need ${videoCost} credits but have ${credits?.balance ?? 0}`);
      return;
    }

    setLoading(true);
    try {
      // Call generation API
      alert("Video generation started! This feature will be available soon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Banner for FREE users */}
      {isFreePlan && (
        <Alert className="border-yellow-600 bg-yellow-900/20">
          <Lock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-200">
            <strong>Video generation is a premium feature.</strong> Upgrade to Starter plan or higher to create videos.
            <Button size="sm" variant="outline" className="ml-4 text-yellow-600 border-yellow-600 hover:bg-yellow-900/50">
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Generation Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-purple-700 bg-purple-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Create Your Video
              </CardTitle>
              <CardDescription>Describe the video you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-purple-200">
                  Video Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your video... e.g., 'A sunset over mountains with birds flying'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isFreePlan || loading}
                  className="min-h-24 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                />
                <p className="text-xs text-purple-400">{prompt.length}/2000 characters</p>
              </div>

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label className="text-purple-200">Duration</Label>
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((dur) => (
                    <Button
                      key={dur.value}
                      variant={duration === dur.value ? "default" : "outline"}
                      className={`${
                        duration === dur.value
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-purple-600 text-purple-200 hover:bg-purple-900/50"
                      }`}
                      onClick={() => setDuration(dur.value)}
                      disabled={isFreePlan || loading}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {dur.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <Label className="text-purple-200">Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map((s) => (
                    <Button
                      key={s.id}
                      variant={style === s.id ? "default" : "outline"}
                      className={`h-auto flex flex-col items-start p-3 ${
                        style === s.id
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-purple-600 text-purple-200 hover:bg-purple-900/50 justify-start"
                      }`}
                      onClick={() => setStyle(s.id)}
                      disabled={isFreePlan || loading}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs opacity-70">{s.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isFreePlan || !hasEnoughCredits || loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>

              {isFreePlan && (
                <Alert className="border-purple-600 bg-purple-900/20">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-purple-300">
                    Video generation is locked for FREE plan. Upgrade to Starter or higher.
                  </AlertDescription>
                </Alert>
              )}

              {!isFreePlan && !hasEnoughCredits && (
                <Alert className="border-red-600 bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Insufficient credits. You need {videoCost} credits but have {credits?.balance ?? 0}.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit Cost Preview */}
        <div className="space-y-4">
          <Card className="border-purple-700 bg-purple-950/50 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Credit Cost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Base Cost</span>
                  <span className="text-purple-100 font-medium">{videoCost} credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Your Balance</span>
                  <span className={`font-medium ${(credits?.balance ?? 0) >= videoCost ? "text-green-400" : "text-red-400"}`}>
                    {credits?.balance ?? 0} credits
                  </span>
                </div>
                <div className="border-t border-purple-600 pt-2 flex justify-between">
                  <span className="text-purple-200 font-medium">After Generation</span>
                  <span className="text-purple-100 font-bold">
                    {Math.max(0, (credits?.balance ?? 0) - videoCost)} credits
                  </span>
                </div>
              </div>

              <div className="bg-purple-900/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-purple-300">Plan: {plan}</p>
                {isFreePlan ? (
                  <p className="text-xs text-purple-400">
                    Upgrade to unlock video generation
                  </p>
                ) : (
                  <p className="text-xs text-purple-400">
                    {hasEnoughCredits ? "You have enough credits" : "Not enough credits"}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full border-purple-600 text-purple-200 hover:bg-purple-900/50"
              >
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-purple-700 bg-purple-950/50">
            <CardHeader>
              <CardTitle className="text-sm">Tips for Better Videos</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-purple-300">
              <p>• Be specific about what you want</p>
              <p>• Include mood and atmosphere</p>
              <p>• Mention camera movements</p>
              <p>• Specify colors and lighting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
