import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Loader2, Scissors } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function RemoveBackground() {
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateMutation = trpc.generation.create.useMutation();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-purple-500", "bg-purple-500/10");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-purple-500", "bg-purple-500/10");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-purple-500", "bg-purple-500/10");

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
        setImageUrl(dataUrl);
        setActiveTab("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageUrl) {
      toast.error("Please provide an image URL or upload an image");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        type: "BGREMOVE",
        prompt: imageUrl,
        quality: "standard",
      });

      if (result.success) {
        if (result.outputUrl) {
          setResultUrl(result.outputUrl);
          toast.success("Background removed successfully!");
        } else {
          toast.info("Background removal started. Check History for your image.");
        }
      }
    } catch (error) {
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `no-bg-${Date.now()}.png`;
      link.click();
      toast.success("Image downloaded!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">AI Background Remover</h1>
          </div>
          <p className="text-gray-400">Remove background from any image instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Selection */}
            <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("url")}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === "url"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Image URL
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                  activeTab === "upload"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Upload Image
              </button>
            </div>

            {/* URL Input Tab */}
            {activeTab === "url" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-500/5"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-2">Drag and drop your image here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse (Max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="text-purple-400 border-purple-500/50 hover:bg-purple-500/10"
                >
                  Select Image
                </Button>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Original Image</label>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg max-h-96 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Before/After Comparison */}
            {resultUrl && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Result</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 text-center">Original</p>
                    <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="w-full h-auto rounded max-h-64 object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 text-center">Background Removed</p>
                    <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
                      <img
                        src={resultUrl}
                        alt="Result"
                        className="w-full h-auto rounded max-h-64 object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Use Cases */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {["Product photos", "Profile pictures", "Logo design", "Social media posts"].map(
                  (use) => (
                    <span
                      key={use}
                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                    >
                      {use}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            {/* Credit Cost Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">Credit Cost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Per image</span>
                  <span className="text-2xl font-bold text-purple-400">3</span>
                </div>
                <p className="text-xs text-gray-400">Standard quality background removal</p>
              </CardContent>
            </Card>

            {/* Remove Background Button */}
            <Button
              onClick={handleRemoveBackground}
              disabled={isGenerating || !previewUrl}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5 mr-2" />
                  Remove Background
                </>
              )}
            </Button>

            {/* Download Button */}
            {resultUrl && (
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PNG
              </Button>
            )}

            {/* Info Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-400">
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>Upload or paste image URL</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>Click Remove Background</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>Download your result</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
