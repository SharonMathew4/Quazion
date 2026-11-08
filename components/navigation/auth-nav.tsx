"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, FileText, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function AuthNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    }

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-24 h-8 rounded-md bg-slate-100 animate-pulse border border-slate-200" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/auth/login">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-slate-700 hover:text-slate-900 border-slate-300 whitespace-nowrap px-3 py-1.5 cursor-pointer shadow-2xs"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/creator/publications/new">
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3.5 py-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Submit Manuscript</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href="/creator/publications/new">
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap px-3.5 py-1.5 hidden md:inline-flex cursor-pointer shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Submit Manuscript</span>
        </Button>
      </Link>

      <Link href="/creator/dashboard">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-xs font-medium border-slate-300 text-slate-800 hover:bg-slate-50 whitespace-nowrap px-3 py-1.5 cursor-pointer shadow-2xs"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
          <span>Dashboard</span>
        </Button>
      </Link>

      <button
        onClick={handleLogout}
        title="Sign Out of Journal Session"
        className="p-1.5 rounded-md text-slate-500 hover:text-rose-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
