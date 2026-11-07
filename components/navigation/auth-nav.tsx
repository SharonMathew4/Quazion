"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, PenSquare } from "lucide-react";
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
      <div className="w-20 h-8 rounded-lg bg-slate-800/40 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/login?mode=signup">
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 text-xs font-semibold">
            <PenSquare className="w-3.5 h-3.5 text-slate-950" />
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/creator/dashboard">
        <Button variant="secondary" size="sm" className="flex items-center gap-1.5 font-mono text-xs">
          <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
          <span>Dashboard</span>
        </Button>
      </Link>

      <button
        onClick={handleLogout}
        title="Sign Out"
        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
