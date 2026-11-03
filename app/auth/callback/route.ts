import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/creator/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Ensure profile exists in public.profiles table
      const user = data.user;
      const metadata = user.user_metadata || {};
      const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "Researcher";
      const username = user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || `user_${user.id.slice(0, 8)}`;
      const avatarUrl = metadata.avatar_url || metadata.picture;

      await supabase.from("profiles").upsert(
        {
          id: user.id,
          username: username,
          display_name: displayName,
          avatar_url: avatarUrl,
          role: "CREATOR",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login if error or missing code
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
