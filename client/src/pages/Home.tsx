import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Sparkles, Zap, Users, TrendingUp, Image, Video, BookOpen, User2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">AI Viral Creation</h1>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <a href={getLoginUrl()}>Get Started Free</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Create Stunning AI Content in Seconds
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Generate professional images, videos, stories, and avatars powered by advanced AI. Start free with 10 credits—no credit card required.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">50K+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">2M+</div>
            <div className="text-sm text-gray-400">Generations</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">150+</div>
            <div className="text-sm text-gray-400">Countries</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8" asChild>
            <a href={getLoginUrl()}>🚀 Start Free — 10 Credits</a>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            ▶ Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">What We Offer</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Image Generation */}
          <Card className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardHeader>
              <Image className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI Image Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Create photorealistic images, art, and illustrations from text prompts
              </CardDescription>
              <div className="mt-4 text-sm text-purple-400">5 credits/image</div>
            </CardContent>
          </Card>

          {/* Video Generation */}
          <Card className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardHeader>
              <Video className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI Video Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Turn text or images into short cinematic videos
              </CardDescription>
              <div className="mt-4 text-sm text-purple-400">20 credits/5sec video</div>
            </CardContent>
          </Card>

          {/* Story Generation */}
          <Card className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI Story Writing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Generate engaging blog posts and stories with AI
              </CardDescription>
              <div className="mt-4 text-sm text-purple-400">2 credits/story</div>
            </CardContent>
          </Card>

          {/* Avatar Generation */}
          <Card className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition">
            <CardHeader>
              <User2 className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">AI Avatar Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Create realistic AI avatars and digital personas
              </CardDescription>
              <div className="mt-4 text-sm text-purple-400">10 credits/avatar</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-12">Simple, Transparent Pricing</h3>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Starter */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Starter</CardTitle>
              <CardDescription>Perfect for trying it out</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-purple-400">₹99</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 100 Credits</li>
                <li>✓ Standard Quality</li>
                <li>✓ Watermarked Output</li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="bg-slate-800 border-purple-500/50 ring-2 ring-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Pro</CardTitle>
              <CardDescription>Most popular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-purple-400">₹499</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 500 Credits</li>
                <li>✓ HD Quality</li>
                <li>✓ No Watermark</li>
                <li>✓ Download All</li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Business</CardTitle>
              <CardDescription>For professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-purple-400">₹1,999</div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 2000 Credits</li>
                <li>✓ 4K Quality</li>
                <li>✓ Priority Support</li>
                <li>✓ API Access</li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Affiliate Section */}
      <section className="container mx-auto px-4 py-20 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Earn Money with Our Affiliate Program</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join our affiliate program and earn 30% commission on every referral. Get your unique code and start earning today!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">30% Commission</h4>
            <p className="text-gray-400 text-sm">Earn on every purchase from your referrals</p>
          </div>
          <div className="text-center">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Unlimited Referrals</h4>
            <p className="text-gray-400 text-sm">No limits on how many people you can refer</p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Instant Payouts</h4>
            <p className="text-gray-400 text-sm">Get paid directly to your bank account</p>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700" asChild>
            <a href="/affiliate">Join Affiliate Program</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400">Features</a></li>
                <li><a href="#" className="hover:text-purple-400">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-400">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400">About</a></li>
                <li><a href="#" className="hover:text-purple-400">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/policy/terms" className="hover:text-purple-400">Terms</a></li>
                <li><a href="/policy/privacy" className="hover:text-purple-400">Privacy</a></li>
                <li><a href="/policy/refund" className="hover:text-purple-400">Refund</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-purple-400">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-400">Discord</a></li>
                <li><a href="#" className="hover:text-purple-400">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 AI Viral Creation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
