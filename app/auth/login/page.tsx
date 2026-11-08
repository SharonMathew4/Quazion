"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "@/public/logo.png";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  Award,
  X
} from "lucide-react";

function AuthPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/creator/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/creator/dashboard";

  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | "orcid" | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const rawError = searchParams.get("error");
  let formattedError = rawError;
  if (rawError === "auth_failed") {
    formattedError = "OAuth authentication could not be completed. Please try again.";
  } else if (rawError === "orcid_not_configured") {
    formattedError = "ORCID API is not configured yet. Set NEXT_PUBLIC_ORCID_CLIENT_ID and ORCID_CLIENT_SECRET in .env.local.";
  } else if (rawError === "session_expired") {
    formattedError = "Your session expired. Please sign in again.";
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(formattedError);
  const supabase = createClient();

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setErrorMessage(null);
      setLoadingProvider(provider);
      const origin = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("not enabled") || 
          error.message.toLowerCase().includes("unsupported") ||
          error.message.toLowerCase().includes("disabled")
        ) {
          setShowConfigModal(true);
        } else {
          setErrorMessage(error.message);
        }
        setLoadingProvider(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to initialize ${provider} authentication.`;
      setErrorMessage(message);
      setLoadingProvider(null);
    }
  };

  const handleOrcidSignIn = () => {
    setLoadingProvider("orcid");
    setErrorMessage(null);
    window.location.href = `/auth/orcid?mode=login&next=${encodeURIComponent(next)}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans bg-slate-50">
      <div className="max-w-md w-full academic-card p-6 sm:p-8 rounded-md bg-white border border-slate-300 space-y-6 shadow-sm">
        
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to repository</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-md bg-white border border-slate-300 flex items-center justify-center mx-auto mb-2 p-1.5 shadow-2xs">
            <Image
              src={logoImg}
              alt="QUAZION Logo"
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Researcher &amp; Author Portal
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Sign in with your verified scholarly identity to submit, peer-review, and track scientific manuscripts.
          </p>
        </div>

        {/* Trust Banner */}
        <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] leading-relaxed">
            Zero-password infrastructure with cryptographic OAuth 2.0 PKCE authentication.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Authentication Options */}
        <div className="space-y-3 pt-1">
          
          {/* ORCID Primary Action */}
          <button
            type="button"
            onClick={handleOrcidSignIn}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-between border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-slate-900 font-medium py-3 px-4 rounded-md transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-xs bg-[#A6CE39] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                iD
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                  Continue with ORCID
                </div>
                <div className="text-[10px] text-emerald-800 font-mono">
                  Open Researcher &amp; Contributor ID
                </div>
              </div>
            </div>
            {loadingProvider === "orcid" ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Award className="w-4 h-4 text-emerald-700 group-hover:text-emerald-900 transition-colors" />
            )}
          </button>

          {/* Google OAuth Action */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-between border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 px-4 rounded-md cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-xs font-semibold text-slate-800">University / Google Workspace</span>
            </div>
            {loadingProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* GitHub OAuth Action */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={loadingProvider !== null}
            className="w-full flex items-center justify-between border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium py-2.5 px-4 rounded-md cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 shrink-0 fill-current text-slate-800" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="text-xs font-semibold text-slate-800">GitHub Developer Identity</span>
            </div>
            {loadingProvider === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Security & Academic Standards */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5 text-center">
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
            <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>COPE Aligned</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ORCID Verified</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By signing in, you agree to the QUAZION Open Scientific Publishing Code of Conduct and Research Ethics Guidelines.
          </p>
        </div>

      </div>

      {/* Provider Configuration Guide Modal */}
      {showConfigModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-slate-300 rounded-md p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">OAuth Provider Notice</h3>
                <span className="text-xs text-slate-500 font-mono">Supabase Authentication Setup</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">
                This OAuth provider is not yet enabled in your Supabase project:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] font-mono">
                <li>Open Supabase Dashboard &gt; Authentication &gt; Providers</li>
                <li>Enable Google / GitHub with your Client ID &amp; Secret</li>
                <li>Set Callback URL: <code className="text-rose-700 bg-white px-1 py-0.5 rounded border border-slate-200">https://&lt;project&gt;.supabase.co/auth/v1/callback</code></li>
              </ol>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowConfigModal(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
          <div className="academic-card p-8 rounded-md bg-white border border-slate-200 flex items-center gap-3 text-slate-600 font-sans text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-rose-700" />
            <span>Loading researcher portal...</span>
          </div>
        </div>
      }
    >
      <AuthPortal />
    </Suspense>
  );
}
