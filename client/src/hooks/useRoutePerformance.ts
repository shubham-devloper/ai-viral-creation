import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface PerformanceData {
  route_path: string;
  page_load_time: number;
  referrer?: string;
  device_type?: string;
  browser?: string;
}

export function useRoutePerformance() {
  const [location] = useLocation();
  const trackPerformanceMutation = trpc.system.trackPerformance.useMutation();
  const performanceDataRef = useRef<{
    startTime: number;
    recordId?: number;
    hasInteraction: boolean;
  }>({
    startTime: 0,
    hasInteraction: false,
  });

  // Track page load time and initial metrics
  useEffect(() => {
    const startTime = performance.now();
    performanceDataRef.current.startTime = startTime;
    performanceDataRef.current.hasInteraction = false;

    // Wait for page to fully load
    const handleLoad = () => {
      const loadTime = Math.round(performance.now() - startTime);

      const deviceType = getDeviceType();
      const browser = getBrowserName();

      const data: PerformanceData = {
        route_path: location,
        page_load_time: loadTime,
        referrer: document.referrer || undefined,
        device_type: deviceType,
        browser: browser,
      };

      trackPerformanceMutation.mutate(data, {
        onSuccess: (response: any) => {
          performanceDataRef.current.recordId = response.recordId;
        },
      });
    };

    // If page is already loaded, call immediately
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, [location, trackPerformanceMutation]);

  // Track user interactions
  useEffect(() => {
    const handleInteraction = () => {
      performanceDataRef.current.hasInteraction = true;
    };

    const events = ["click", "scroll", "keydown", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  // Track time on page and bounce
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime;
      const bounce = !performanceDataRef.current.hasInteraction;

      if (performanceDataRef.current.recordId) {
        trackPerformanceMutation.mutate({
          route_path: location,
          page_load_time: 0, // Not used in update
          recordId: performanceDataRef.current.recordId,
          time_on_page: timeOnPage,
          had_interaction: performanceDataRef.current.hasInteraction,
          bounce: bounce,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location, trackPerformanceMutation]);
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|phone/i.test(ua.toLowerCase())) {
    return /ipad/i.test(ua) ? "tablet" : "mobile";
  }
  return "desktop";
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf("Firefox") > -1) return "Firefox";
  if (ua.indexOf("Chrome") > -1) return "Chrome";
  if (ua.indexOf("Safari") > -1) return "Safari";
  if (ua.indexOf("Edge") > -1) return "Edge";
  return "Other";
}
