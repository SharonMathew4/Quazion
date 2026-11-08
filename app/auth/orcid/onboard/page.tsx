"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Atom, Award, Mail, Building, User, Loader2, AlertCircle, ArrowRight } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/creator/dashboard";

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/orcid/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim(),
          affiliation: affiliation.trim(),
          next,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setErrorMessage(data.error || "Failed to complete onboarding.");
        setLoading(false);
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 font-sans">
      <div className="max-w-md w-full academic-card bg-white p-6 sm:p-8 rounded border border-slate-200 shadow-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6 text-emerald-700" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            ORCID Authenticated
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Please confirm your institutional email for peer-review and editorial correspondence.
          </p>
        </div>

        {/* ORCID Verification Chip */}
        <div className="p-3.5 rounded bg-slate-50 border border-emerald-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-slate-800 font-medium">ORCID 3-Legged OAuth Verified</span>
          </div>
          <span className="text-emerald-700 font-mono text-[11px] font-semibold">Active</span>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed font-sans">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-700 flex items-center gap-1.5 font-bold">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Name / Academic Title *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Dr. Eleanor Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-700 flex items-center gap-1.5 font-bold">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Institutional / Academic Email *</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g., e.vance@mit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-700 flex items-center gap-1.5 font-bold">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Institutional Affiliation (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Department of Physics, Harvard University"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-2 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Completing Setup...</span>
              </>
            ) : (
              <>
                <span>Complete Registration &amp; Enter Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function OrcidOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
          <div className="academic-card p-8 rounded bg-white border border-slate-200 shadow-2xs flex items-center gap-3 text-slate-700 font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-rose-700" />
            <span>Loading ORCID profile...</span>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
