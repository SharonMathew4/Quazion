"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Atom, 
  Shield, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  Building,
  Eye, 
  EyeOff,
  Loader2,
  X,
  ExternalLink
} from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get("mode") === "signup" || pathname?.includes("/signup");

  const [mode, setMode] = useState<"login" | "signup">(isSignUp ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") === "auth_failed" ? "Authentication could not be completed. Please try again." : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [affiliation, setAffiliation] = useState("");

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!displayName.trim() || !username.trim()) {
          setErrorMessage("Please provide your full name and a unique username.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }

        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

        // 1. Sign up user with metadata
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              display_name: displayName.trim(),
              username: cleanUsername,
              affiliation: affiliation.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          setErrorMessage(signUpError.message);
          setLoading(false);
          return;
        }

        // If session exists immediately (email confirmation disabled in Supabase)
        if (data?.session && data?.user) {
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              username: cleanUsername,
              display_name: displayName.trim(),
              affiliation: affiliation.trim() || undefined,
              role: "CREATOR",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          router.push("/creator/dashboard");
          router.refresh();
          return;
        }

        // If email confirmation is required
        setSuccessMessage(
          `Account created! A confirmation email has been sent to ${email}. Please verify your email before signing in.`
        );
        setLoading(false);
      } else {
        // Sign In mode
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (signInError) {
          setErrorMessage(signInError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Ensure profile exists in public.profiles table
          const meta = data.user.user_metadata || {};
          const cleanUsername = meta.username || data.user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${data.user.id.slice(0, 8)}`;
          const displayName = meta.display_name || meta.full_name || meta.name || data.user.email?.split("@")[0] || "Researcher";

          try {
            await supabase.from("profiles").upsert(
              {
                id: data.user.id,
                username: cleanUsername,
                display_name: displayName,
                role: "CREATOR",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          } catch {
            // Dashboard auto-heals if this fails
          }

          const next = searchParams.get("next") || "/creator/dashboard";
          router.push(next);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const proceedGoogleAuth = async () => {
    try {
      setLoading(true);
      setShowGoogleModal(false);
      setErrorMessage(null);
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(
          error.message.toLowerCase().includes("not enabled") || error.message.toLowerCase().includes("unsupported")
            ? "Google OAuth is not enabled in your Supabase project. Please enable Google in Supabase Dashboard (Authentication > Providers > Google), or use Email & Password."
            : error.message
        );
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initialize Google authentication.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full cosmic-card p-6 sm:p-8 rounded-2xl space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to repository</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2">
            <Atom className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            {mode === "login" ? "Welcome Back to QUAZION" : "Join QUAZION Archive"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === "login"
              ? "Sign in to manage your scientific publications and drafts."
              : "Create a researcher account to author, submit, and publish papers."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Verification link sent</p>
              <p className="text-slate-300 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Full Name / Display Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sharon Mathew"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <span className="text-sky-400 font-bold">@</span>
                  <span>Username *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sharonmathew"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              {/* Scientific Affiliation */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Institutional Affiliation (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Astrophysics Research Lab / Independent"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              placeholder="researcher@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Password *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-2 font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === "login" ? "Authenticating..." : "Creating Account..."}</span>
              </span>
            ) : mode === "login" ? (
              "Sign In to Studio"
            ) : (
              "Register Researcher Account"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono">
            <span className="bg-slate-900/90 px-3 text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Action Button */}
        <div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 font-medium py-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Security & Terms Notice */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2 text-center">
          <div className="flex items-center gap-1.5 justify-center text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted session &amp; RLS security</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By signing in or registering, you agree to the QUAZION Open Scientific Publishing Guidelines.
          </p>
        </div>

      </div>

      {/* Google OAuth Configuration Helper Modal */}
      {showGoogleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 cosmic-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center">
                  <Atom className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Google Authentication</h3>
                  <span className="text-[11px] font-mono text-slate-400">Supabase OAuth Provider</span>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200">
                To sign in with Google, Google OAuth must be enabled in your Supabase project:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] font-mono">
                <li>Create credentials in Google Cloud Console</li>
                <li>Set Redirect URI to Supabase Auth callback</li>
                <li>Enable Google in Supabase Dashboard (Auth &gt; Providers)</li>
              </ol>
              <p className="text-[11px] text-sky-400 pt-1">
                Tip: You can register and use all features right now with Email &amp; Password!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={proceedGoogleAuth}
                className="flex-1 flex items-center justify-center gap-1.5 font-medium"
              >
                <span>Proceed with Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGoogleModal(false)}
                className="flex-1 text-xs"
              >
                Use Email &amp; Password
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
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="cosmic-card p-8 rounded-2xl flex items-center gap-3 text-slate-400 font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span>Loading authentication studio...</span>
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
