import { useProtectedRoute, useAdminRoute } from "@/_core/hooks/useProtectedRoute";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  isAdmin?: boolean;
}

export default function ProtectedRoute({ component: Component, isAdmin = false }: ProtectedRouteProps) {
  const protectedRoute = useProtectedRoute();
  const adminRoute = useAdminRoute();

  const { loading: protectedLoading } = protectedRoute;
  const { loading: adminLoading } = adminRoute;

  if (protectedLoading || (isAdmin && adminLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAdmin && !adminRoute.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Access Denied</p>
          <p className="text-gray-400 text-sm">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <Component />;
}
