import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Play, Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BatchPrompt {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
}

export default function BatchGeneration() {
  const [generationType, setGenerationType] = useState<"IMAGE" | "AVATAR">("IMAGE");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [prompts, setPrompts] = useState<BatchPrompt[]>([
    { id: "1", prompt: "", status: "pending" },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generateMutation = trpc.generation.create.useMutation();
  const creditQuery = trpc.credits.getBalance.useQuery();

  const creditCosts: Record<string, Record<string, number>> = {
    IMAGE: { standard: 5, hd: 8 },
    AVATAR: { standard: 10, hd: 15 },
  };

  const costPerItem = creditCosts[generationType]?.[quality] ?? 5;
  const totalCost = prompts.filter((p) => p.prompt.trim()).length * costPerItem;
  const availableCredits = creditQuery.data?.balance ?? 0;

  const addPrompt = () => {
    setPrompts([
      ...prompts,
      { id: Date.now().toString(), prompt: "", status: "pending" },
    ]);
  };

  const removePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((p) => p.id !== id));
    }
  };

  const updatePrompt = (id: string, text: string) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, prompt: text } : p)));
  };

  const handleStartBatch = async () => {
    const validPrompts = prompts.filter((p) => p.prompt.trim());
    if (validPrompts.length === 0) {
      toast.error("Please add at least one prompt");
      return;
    }

    if (availableCredits < totalCost) {
      toast.error(`Insufficient credits. Need ${totalCost}, have ${availableCredits}`);
      return;
    }

    setIsGenerating(true);
    setCurrentIndex(0);

    // Reset all prompts to pending
    setPrompts(prompts.map((p) => ({ ...p, status: "pending" })));

    // Process each prompt sequentially
    for (let i = 0; i < validPrompts.length; i++) {
      const prompt = validPrompts[i];
      setCurrentIndex(i);

      try {
        // Update status to processing
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id ? { ...p, status: "processing" } : p
          )
        );

        const result = await generateMutation.mutateAsync({
          type: generationType,
          prompt: prompt.prompt,
          quality,
        });

        if (result.success) {
          setPrompts((prev) =>
            prev.map((p) =>
              p.id === prompt.id
                ? {
                    ...p,
                    status: result.outputUrl ? "completed" : "pending",
                    outputUrl: result.outputUrl,
                  }
                : p
            )
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Generation failed";
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id
              ? { ...p, status: "failed", error: errorMsg }
              : p
          )
        );
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsGenerating(false);
    toast.success("Batch generation complete!");
  };

  const completedCount = prompts.filter((p) => p.status === "completed").length;
  const failedCount = prompts.filter((p) => p.status === "failed").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Play className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Batch Generation</h1>
          </div>
          <p className="text-gray-400">Generate multiple images or avatars in one go</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type & Quality Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={generationType}
                      onChange={(e) =>
                        setGenerationType(e.target.value as "IMAGE" | "AVATAR")
                      }
                      disabled={isGenerating}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="AVATAR">Avatar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quality
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as "standard" | "hd")}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                    >
                      <option value="standard">Standard ({costPerItem} credits)</option>
                      <option value="hd">HD ({costPerItem} credits)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompts List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Prompts</h2>
                <span className="text-sm text-gray-400">
                  {prompts.filter((p) => p.prompt.trim()).length} of {prompts.length}
                </span>
              </div>

              {prompts.map((prompt, index) => (
                <div key={prompt.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <textarea
                        value={prompt.prompt}
                        onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                        disabled={isGenerating}
                        placeholder={`Prompt ${index + 1}... (min 10 characters)`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
                        rows={3}
                      />
                    </div>
                    {prompts.length > 1 && (
                      <button
                        onClick={() => removePrompt(prompt.id)}
                        disabled={isGenerating}
                        className="mt-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Status Indicator */}
                  {prompt.status !== "pending" && (
                    <div className="flex items-center gap-2 text-sm">
                      {prompt.status === "processing" && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          <span className="text-blue-400">Processing...</span>
                        </>
                      )}
                      {prompt.status === "completed" && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Completed</span>
                          {prompt.outputUrl && (
                            <button
                              onClick={() => {
                                window.open(prompt.outputUrl, "_blank");
                              }}
                              className="ml-auto text-purple-400 hover:text-purple-300"
                            >
                              View
                            </button>
                          )}
                        </>
                      )}
                      {prompt.status === "failed" && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">{prompt.error || "Failed"}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Preview Image */}
                  {prompt.outputUrl && (
                    <div className="mt-2">
                      <img
                        src={prompt.outputUrl}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-32 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button
                onClick={addPrompt}
                disabled={isGenerating}
                variant="outline"
                className="w-full text-purple-400 border-purple-500/50 hover:bg-purple-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>
          </div>

          {/* Right Column - Summary & Controls */}
          <div className="space-y-4">
            {/* Cost Summary */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Batch Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Prompts:</span>
                    <span className="text-white font-semibold">
                      {prompts.filter((p) => p.prompt.trim()).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Cost per item:</span>
                    <span className="text-white font-semibold">{costPerItem}</span>
                  </div>
                  <div className="border-t border-purple-500/20 pt-2 flex justify-between">
                    <span className="text-gray-300 font-medium">Total Cost:</span>
                    <span className="text-purple-300 font-bold text-lg">{totalCost}</span>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Available Credits</p>
                  <p className="text-2xl font-bold text-white">{availableCredits}</p>
                </div>

                {totalCost > availableCredits && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-400">
                      Need {totalCost - availableCredits} more credits
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            {isGenerating && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {currentIndex + 1} / {prompts.filter((p) => p.prompt.trim()).length}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((currentIndex + 1) /
                              prompts.filter((p) => p.prompt.trim()).length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {(completedCount > 0 || failedCount > 0) && !isGenerating && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      Completed: <span className="font-semibold text-white">{completedCount}</span>
                    </span>
                  </div>
                  {failedCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-300">
                        Failed: <span className="font-semibold text-white">{failedCount}</span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStartBatch}
              disabled={
                isGenerating ||
                prompts.filter((p) => p.prompt.trim()).length === 0 ||
                totalCost > availableCredits
              }
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Batch Generation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
