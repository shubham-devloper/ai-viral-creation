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
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminGenerations from "./pages/AdminGenerations";
import AgeVerificationModal from "./components/AgeVerificationModal";
import Pricing from "./pages/Pricing";
import Affiliate from "./pages/Affiliate";
import Blog from "./pages/Blog";
import PolicyPage from "./pages/PolicyPage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/dashboard/credits"} component={() => <ProtectedRoute component={CreditsPage} />} />
      <Route path={"/dashboard/history"} component={() => <ProtectedRoute component={HistoryPage} />} />
      <Route path={"/dashboard/settings"} component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path={"/dashboard/generate-image"} component={() => <ProtectedRoute component={GenerateImage} />} />
      <Route path={"/dashboard/generate-story"} component={() => <ProtectedRoute component={GenerateStory} />} />
      <Route path={"/dashboard/generate-avatar"} component={() => <ProtectedRoute component={GenerateAvatar} />} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminDashboard} isAdmin />} />
      <Route path={"/admin/users"} component={() => <ProtectedRoute component={AdminUsers} isAdmin />} />
      <Route path={"/admin/generations"} component={() => <ProtectedRoute component={AdminGenerations} isAdmin />} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/affiliate"} component={Affiliate} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={() => <div className="p-8 text-center">Article (Coming Soon)</div>} />
      <Route path={"/policy/:type"} component={PolicyPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
