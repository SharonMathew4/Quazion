"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * AuthHashScrubber Component
 *
 * Security & Session Establishment:
 * 1. Detects if an access_token or token is present in the URL hash fragment (#access_token=...).
 * 2. IMMEDIATELY scrubs the URL hash from the browser address bar using window.history.replaceState
 *    to prevent shoulder-surfing, browser history logging, and referrer header leakage.
 * 3. Saves the session into Supabase client storage and syncs cookies.
 * 4. If on an auth page, automatically redirects to the destination route.
 */
export function AuthHashScrubber() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    // Parse hash parameters
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") || "";

    // 1. CRITICAL: Wipe token immediately from the address bar!
    const cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", cleanUrl);

    // 2. Establish session securely in client SDK
    if (accessToken) {
      const supabase = createClient();
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ data, error }) => {
          if (!error && data?.session) {
            // If user landed on /auth/login or /auth/signup, redirect to destination
            if (
              window.location.pathname.startsWith("/auth/login") ||
              window.location.pathname.startsWith("/auth/signup")
            ) {
              const nextParam = new URLSearchParams(window.location.search).get("next");
              const destination =
                nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
                  ? nextParam
                  : "/creator/dashboard";
              router.replace(destination);
              router.refresh();
            }
          }
        });
    }
  }, [router]);

  return null;
}

