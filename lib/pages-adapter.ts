// lib/pages-adapter.ts
// Adapter to make React Router pages work with Next.js
"use client"

import { useRouter as useNextRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Create a unified router interface that works with both frameworks
export function createPageRouter() {
  const router = useNextRouter();

  return {
    push: (path: string, options?: { state?: any }) => {
      if (options?.state) {
        sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
      }
      router.push(path);
    },
    back: () => router.back(),
    replace: (path: string, options?: { state?: any }) => {
      if (options?.state) {
        sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
      }
      router.replace(path);
    },
    navigate: (path: string | -1, options?: { state?: any }) => {
      if (path === -1) {
        router.back();
      } else if (typeof path === "string") {
        if (options?.state) {
          sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
        }
        router.push(path);
      }
    },
  };
}

// Export a hook that mimics useNavigate
export function useNavigate() {
  const router = useNextRouter();
  return (path: string | -1, options?: { state?: any }) => {
    if (path === -1) {
      router.back();
    } else if (typeof path === "string") {
      if (options?.state) {
        sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
      }
      router.push(path);
    }
  };
}

// Mock useHistory for components that need it
export function useHistory() {
  const router = useNextRouter();
  return {
    push: (path: string, options?: { state?: any }) => {
      if (options?.state) {
        sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
      }
      router.push(path);
    },
    goBack: () => router.back(),
    replace: (path: string, options?: { state?: any }) => {
      if (options?.state) {
        sessionStorage.setItem("jumpa_nav_state", JSON.stringify(options.state));
      }
      router.replace(path);
    },
  };
}

// Mock useLocation for components
export function useLocation() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("jumpa_nav_state");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse navigation state", e);
      }
    }
  }, []);

  return {
    pathname: typeof window !== "undefined" ? window.location.pathname : "",
    search: typeof window !== "undefined" ? window.location.search : "",
    hash: typeof window !== "undefined" ? window.location.hash : "",
    state,
  };
}

// Export global replacements
export const ReactRouterAdapters = {
  useNavigate,
  useHistory,
  useLocation,
};

