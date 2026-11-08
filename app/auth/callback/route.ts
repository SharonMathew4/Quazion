import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Handles OAuth 2.0 PKCE Code Exchange for Google and GitHub providers.
 * Validates state, establishes authenticated session, and provisions researcher profile.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");
  const rawNext = searchParams.get("next") || "/creator/dashboard";
  
  // Prevent Open Redirect attacks: ensure redirect target is strictly relative
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/creator/dashboard";

  if (errorDescription) {
    console.error("Supabase OAuth callback error:", errorDescription);
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const metadata = user.user_metadata || {};

      // Check if researcher profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Extract provider metadata cleanly
        const displayName =
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Researcher";

        const rawUsername =
          metadata.user_name ||
          metadata.preferred_username ||
          user.email?.split("@")[0] ||
          `user_${user.id.slice(0, 8)}`;

        const cleanUsername = rawUsername
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 30);

        const avatarUrl = metadata.avatar_url || metadata.picture || null;

        // Provision researcher profile
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            username: cleanUsername || `user_${user.id.slice(0, 8)}`,
            display_name: displayName,
            avatar_url: avatarUrl,
            role: "CREATOR",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } else {
        // Update last active timestamp
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
      console.error("Exchange code error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
