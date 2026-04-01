import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Get query param to determine which tab to show
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") === "signup" ? "signup" : "login";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      // Call login API (placeholder - will be implemented with real auth)
      toast.success("Login functionality coming soon - use OAuth for now");
      
      // Redirect to OAuth login
      // window.location.href = getLoginUrl("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !confirmPassword || !name) {
        setError("Please fill in all fields");
        return;
      }

      if (name.length < 2) {
        setError("Name must be at least 2 characters");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Call signup API (placeholder - will be implemented with real auth)
      toast.success("Sign up functionality coming soon - use OAuth for now");
      
      // Redirect to OAuth login
      // window.location.href = getLoginUrl("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-purple-700 bg-purple-950/50 backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center text-white">AI Viral Creation</CardTitle>
          <CardDescription className="text-center text-purple-300">
            Create stunning AI content in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-purple-900/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-purple-600">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-200">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-purple-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-purple-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Login
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-purple-950/50 text-purple-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-600 text-purple-200 hover:bg-purple-900/50"
                  onClick={() => toast.info("OAuth login coming soon")}
                >
                  OAuth Login
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-200">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-purple-200">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-purple-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-purple-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-purple-200">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-purple-900/30 border-purple-600 text-white placeholder:text-purple-400"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-purple-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-purple-950/50 text-purple-400">Or sign up with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-600 text-purple-200 hover:bg-purple-900/50"
                  onClick={() => toast.info("OAuth signup coming soon")}
                >
                  OAuth Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-purple-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
