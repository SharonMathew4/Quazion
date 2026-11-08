"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

// Simple event-driven toast dispatcher for seamless client calling without complex nesting
type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export function showToast(message: string, type: ToastType = "info", title?: string) {
  const toast: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    title,
    message,
  };
  listeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderClass = "border-slate-300 bg-white text-slate-800";
        let Icon = Info;
        let iconColor = "text-slate-600";

        if (toast.type === "success") {
          borderClass = "border-emerald-200 bg-emerald-50 text-emerald-950";
          Icon = CheckCircle2;
          iconColor = "text-emerald-600";
        } else if (toast.type === "error") {
          borderClass = "border-rose-200 bg-rose-50 text-rose-950";
          Icon = AlertCircle;
          iconColor = "text-rose-600";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto academic-card p-3.5 rounded-md border shadow-lg flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
              <div className="leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

