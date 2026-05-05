import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreditsPage from "./pages/CreditsPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import GenerateImage from "./pages/GenerateImage";
import GenerateStory from "./pages/GenerateStory";
import GenerateAvatar from "./pages/GenerateAvatar";
import GenerateVideo from "./pages/GenerateVideo";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminGenerations from "./pages/AdminGenerations";
import AdminSettings from "./pages/AdminSettings";
import AgeVerificationModal from "./components/AgeVerificationModal";
import Pricing from "./pages/Pricing";
import Affiliate from "./pages/Affiliate";
import Blog from "./pages/Blog";
import PolicyPage from "./pages/PolicyPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import RemoveBackground from "./pages/RemoveBackground";
import ContentModeration from "./pages/ContentModeration";
import BatchGeneration from "./pages/BatchGeneration";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Login} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/dashboard/credits"} component={() => <ProtectedRoute component={CreditsPage} />} />
      <Route path={"/dashboard/history"} component={() => <ProtectedRoute component={HistoryPage} />} />
      <Route path={"/dashboard/settings"} component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path={"/dashboard/generate-image"} component={() => <ProtectedRoute component={GenerateImage} />} />
      <Route path={"/dashboard/generate-story"} component={() => <ProtectedRoute component={GenerateStory} />} />
      <Route path={"/dashboard/generate-avatar"} component={() => <ProtectedRoute component={GenerateAvatar} />} />
      <Route path={"dashboard/generate-video"} component={() => <ProtectedRoute component={GenerateVideo} />} />
      <Route path={"dashboard/affiliate"} component={() => <ProtectedRoute component={AffiliateDashboard} />} />
      <Route path={"dashboard/remove-background"} component={() => <ProtectedRoute component={RemoveBackground} />} />
      <Route path={"dashboard/batch-generation"} component={() => <ProtectedRoute component={BatchGeneration} />} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminDashboard} isAdmin />} />
      <Route path={"/admin/analytics"} component={() => <ProtectedRoute component={AnalyticsDashboard} isAdmin />} />
      <Route path={"/admin/moderation"} component={() => <ProtectedRoute component={ContentModeration} isAdmin />} />
      <Route path={"/admin/users"} component={() => <ProtectedRoute component={AdminUsers} isAdmin />} />
      <Route path={"/admin/generations"} component={() => <ProtectedRoute component={AdminGenerations} isAdmin />} />
      <Route path={"/admin/settings"} component={() => <ProtectedRoute component={AdminSettings} isAdmin />} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/affiliate"} component={Affiliate} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={() => <div className="p-8 text-center">Article (Coming Soon)</div>} />
      <Route path={"/policy/:type"} component={PolicyPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AgeVerificationModal onVerified={() => {}} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
