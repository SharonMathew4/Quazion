"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" && typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 pointer-events-none">
      {!isOnline ? (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-slate-100 text-xs font-mono shadow-lg border border-slate-700 pointer-events-auto backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline mode — serving cached scientific research</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/95 text-emerald-100 text-xs font-mono shadow-lg border border-emerald-700 pointer-events-auto backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <Wifi className="w-3.5 h-3.5 text-emerald-300" />
          <span>Connected — live research archive restored</span>
        </div>
      )}
    </div>
  );
}
