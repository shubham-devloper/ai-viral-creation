import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Eye, EyeOff, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminSettings() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState({
    imageGenerationCost: 5,
    storyGenerationCost: 3,
    avatarGenerationCost: 4,
    videoGenerationCost: 30,
    razorpayKeyId: "rzp_test_xxxxx",
    razorpayKeySecret: "rzp_secret_xxxxx",
    replicateApiToken: "r8_xxxxx",
    manusForgApiKey: "forge_xxxxx",
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleSettingChange = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    toast.success("Settings saved successfully");
    setUnsavedChanges(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const creditCosts = [
    { key: "imageGenerationCost", label: "Image Generation", icon: "🖼️" },
    { key: "storyGenerationCost", label: "Story Generation", icon: "📖" },
    { key: "avatarGenerationCost", label: "Avatar Generation", icon: "👤" },
    { key: "videoGenerationCost", label: "Video Generation", icon: "🎬" },
  ];

  const apiKeys = [
    { key: "razorpayKeyId", label: "Razorpay Key ID", description: "Public key for payment processing" },
    { key: "razorpayKeySecret", label: "Razorpay Key Secret", description: "Secret key for payment verification" },
    { key: "replicateApiToken", label: "Replicate API Token", description: "Token for image generation API" },
    { key: "manusForgApiKey", label: "Manus Forge API Key", description: "Key for LLM and story generation" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          <p className="text-purple-300 mt-2">Configure platform settings, API keys, and generation costs</p>
        </div>

        <Tabs defaultValue="credits" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-purple-900/50">
            <TabsTrigger value="credits" className="data-[state=active]:bg-purple-600">
              Credit Costs
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-purple-600">
              API Keys
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-purple-600">
              Business Rules
            </TabsTrigger>
          </TabsList>

          {/* Credit Costs Tab */}
          <TabsContent value="credits" className="space-y-4">
            <Card className="border-purple-700 bg-purple-950/50">
              <CardHeader>
                <CardTitle>Generation Credit Costs</CardTitle>
                <CardDescription>Set the credit cost for each generation type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {creditCosts.map(cost => (
                  <div key={cost.key} className="space-y-2">
                    <Label className="text-purple-200 flex items-center gap-2">
                      <span className="text-xl">{cost.icon}</span>
                      {cost.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={settings[cost.key as keyof typeof settings]}
                        onChange={(e) => handleSettingChange(cost.key, parseInt(e.target.value))}
                        className="bg-purple-900/30 border-purple-600 text-white w-24"
                      />
                      <span className="text-purple-300">credits</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-200">
                Keep API keys confidential. Never share them publicly or commit to version control.
              </AlertDescription>
            </Alert>

            <Card className="border-purple-700 bg-purple-950/50">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Manage external service credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {apiKeys.map(api => (
                  <div key={api.key} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Label className="text-purple-200">{api.label}</Label>
                        <p className="text-xs text-purple-400 mt-1">{api.description}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(settings[api.key as keyof typeof settings] as string, api.label)}
                        className="p-2 hover:bg-purple-900/50 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showApiKeys ? "text" : "password"}
                        value={settings[api.key as keyof typeof settings]}
                        onChange={(e) => handleSettingChange(api.key, e.target.value)}
                        className="bg-purple-900/30 border-purple-600 text-white pr-10"
                      />
                      <button
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Rules Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card className="border-purple-700 bg-purple-950/50">
              <CardHeader>
                <CardTitle>Business Rules</CardTitle>
                <CardDescription>Configure platform policies and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-purple-200">Free Plan Credits</Label>
                  <p className="text-sm text-purple-400">Credits given to new free users</p>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    defaultValue="10"
                    className="bg-purple-900/30 border-purple-600 text-white w-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Rate Limit (Generations per Minute)</Label>
                  <p className="text-sm text-purple-400">Maximum generations allowed per user per minute</p>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="5"
                    className="bg-purple-900/30 border-purple-600 text-white w-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Min Age for Platform (years)</Label>
                  <p className="text-sm text-purple-400">Minimum age requirement for users</p>
                  <Input
                    type="number"
                    min="13"
                    max="21"
                    defaultValue="18"
                    className="bg-purple-900/30 border-purple-600 text-white w-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Content Moderation Level</Label>
                  <p className="text-sm text-purple-400">Strictness of content filtering (1-10)</p>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="7"
                    className="bg-purple-900/30 border-purple-600 text-white w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-purple-600 text-purple-200 hover:bg-purple-900/50"
            onClick={() => window.location.reload()}
          >
            Discard Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={!unsavedChanges}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
