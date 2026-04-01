import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./useAuth";

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  return { isAuthenticated, loading };
}

/**
 * Hook to protect admin routes
 * Redirects to home if user is not an admin
 */
export function useAdminRoute() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role !== "admin") {
        setLocation("/");
      }
    }
  }, [user, loading, setLocation]);

  return { isAdmin: user?.role === "admin", loading };
}
