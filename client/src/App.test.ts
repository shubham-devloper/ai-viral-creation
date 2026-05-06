import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Route Validation", () => {
  // Read the App.tsx file to extract route definitions
  const appTsxPath = join(__dirname, "App.tsx");
  const appTsxContent = readFileSync(appTsxPath, "utf-8");

  // Extract all Route path definitions using regex
  const routePathRegex = /path=\{["']([^"']+)["']\}/g;
  const routes: string[] = [];
  let match;

  while ((match = routePathRegex.exec(appTsxContent)) !== null) {
    routes.push(match[1]);
  }

  describe("Route Path Format", () => {
    it("should have extracted routes", () => {
      expect(routes.length).toBeGreaterThan(0);
    });

    it("all routes should have leading slashes (except catch-all)", () => {
      const invalidRoutes = routes.filter(
        (route) => route !== "" && !route.startsWith("/")
      );
      expect(
        invalidRoutes,
        `Routes without leading slashes: ${invalidRoutes.join(", ")}`
      ).toHaveLength(0);
    });

    it("should not have duplicate routes", () => {
      const uniqueRoutes = new Set(routes);
      expect(
        routes.length,
        `Found duplicate routes: ${routes.filter(
          (route, index) => routes.indexOf(route) !== index
        )}`
      ).toBe(uniqueRoutes.size);
    });

    it("should not have trailing slashes (except root)", () => {
      const invalidRoutes = routes.filter(
        (route) => route !== "/" && route.endsWith("/")
      );
      expect(
        invalidRoutes,
        `Routes with trailing slashes: ${invalidRoutes.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have consistent route naming (kebab-case)", () => {
      const invalidRoutes = routes.filter((route) => {
        // Skip root and dynamic routes
        if (route === "/" || route.includes(":")) return false;
        // Check for camelCase or snake_case
        const segments = route.split("/").filter((s) => s);
        return segments.some((segment) => /[A-Z_]/.test(segment));
      });
      expect(
        invalidRoutes,
        `Routes not in kebab-case: ${invalidRoutes.join(", ")}`
      ).toHaveLength(0);
    });
  });

  describe("Route Component Mapping", () => {
    it("should have all required dashboard routes", () => {
      const dashboardRoutes = [
        "/dashboard",
        "/dashboard/credits",
        "/dashboard/history",
        "/dashboard/settings",
        "/dashboard/generate-image",
        "/dashboard/generate-story",
        "/dashboard/generate-avatar",
        "/dashboard/generate-video",
        "/dashboard/affiliate",
        "/dashboard/remove-background",
        "/dashboard/batch-generation",
      ];

      dashboardRoutes.forEach((route) => {
        expect(
          routes,
          `Missing dashboard route: ${route}`
        ).toContain(route);
      });
    });

    it("should have all required admin routes", () => {
      const adminRoutes = [
        "/admin",
        "/admin/analytics",
        "/admin/moderation",
        "/admin/users",
        "/admin/generations",
        "/admin/settings",
      ];

      adminRoutes.forEach((route) => {
        expect(routes, `Missing admin route: ${route}`).toContain(route);
      });
    });

    it("should have all required public routes", () => {
      const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/pricing",
        "/affiliate",
        "/blog",
        "/policy/:type",
      ];

      publicRoutes.forEach((route) => {
        expect(routes, `Missing public route: ${route}`).toContain(route);
      });
    });
  });

  describe("Route Consistency", () => {
    it("all protected routes should be under /dashboard or /admin", () => {
      // Extract routes that are wrapped with ProtectedRoute
      const protectedRouteRegex =
        /path=\{["']([^"']+)["']\}[^}]*ProtectedRoute/g;
      const protectedRoutes: string[] = [];
      let match;

      while ((match = protectedRouteRegex.exec(appTsxContent)) !== null) {
        protectedRoutes.push(match[1]);
      }

      const invalidRoutes = protectedRoutes.filter(
        (route) =>
          !route.startsWith("/dashboard") &&
          !route.startsWith("/admin") &&
          route !== "/"
      );

      expect(
        invalidRoutes,
        `Protected routes not under /dashboard or /admin: ${invalidRoutes.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have 404 catch-all route at the end", () => {
      // The last route should be the catch-all (empty path) or /404 route
      const lastRoute = routes[routes.length - 1];
      expect(["", "/404"]).toContain(lastRoute);
    });
  });
});
