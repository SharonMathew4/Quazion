import { NextResponse } from "next/server";
import { exchangeOrcidCodeForToken } from "@/lib/orcid";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { logServerError } from "@/lib/server-logger";

/**
 * Handles the OAuth 2.0 callback from ORCID.
 * Validates state CSRF token, exchanges code for verified ORCID iD,
 * and handles either Account Linking or Direct Login/Registration.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const cookieStore = await cookies();
  const savedCsrfToken = cookieStore.get("quazion_orcid_state")?.value;
  cookieStore.delete("quazion_orcid_state");

  // Handle user cancellation or denial
  if (error || !code) {
    logServerError("ORCID_callback_AuthDenied", new Error(String(errorDesc || error)));
    return NextResponse.redirect(`${origin}/auth/login?error=orcid_cancelled`);
  }

  // Validate state and decode payload
  let statePayload: { csrf: string; mode: "login" | "link"; next: string } | null = null;
  try {
    if (stateParam) {
      const decoded = Buffer.from(stateParam, "base64url").toString("utf-8");
      statePayload = JSON.parse(decoded);
    }
  } catch {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_oauth_state`);
  }

  if (!statePayload || !savedCsrfToken || statePayload.csrf !== savedCsrfToken) {
    return NextResponse.redirect(`${origin}/auth/login?error=csrf_validation_failed`);
  }

  const { mode, next } = statePayload;
  const redirectUri = `${origin}/auth/orcid/callback`;

  // Exchange authorization code with ORCID token endpoint
  let orcidData;
  try {
    orcidData = await exchangeOrcidCodeForToken({ code, redirectUri });
  } catch (err: unknown) {
    logServerError("ORCID_callback_TokenExchange", err);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  const { orcid, name, scope } = orcidData;
  const supabase = await createServerSupabaseClient();

  // =========================================================================
  // CASE 1: ACCOUNT LINKING (Researcher is already signed in)
  // =========================================================================
  if (mode === "link") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/auth/login?error=session_expired`);
    }

    // Check if ORCID is already claimed by another researcher
    const { data: duplicateProfile } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("orcid", orcid)
      .neq("id", user.id)
      .maybeSingle();

    if (duplicateProfile) {
      return NextResponse.redirect(
        `${origin}${next}?tab=about&error=orcid_already_linked`
      );
    }

    // Update current researcher profile with verified ORCID iD
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        orcid: orcid,
        orcid_authenticated_at: new Date().toISOString(),
        orcid_scope: scope || "/authenticate",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      logServerError("ORCID_callback_ProfileUpdate", updateError);
      return NextResponse.redirect(`${origin}${next}?tab=about&error=link_failed`);
    }

    return NextResponse.redirect(`${origin}${next}?tab=about&success=orcid_linked`);
  }

  // =========================================================================
  // CASE 2: DIRECT LOGIN VIA ORCID
  // =========================================================================
  
  // Check if a researcher profile with this verified ORCID already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("orcid", orcid)
    .maybeSingle();

  const adminClient = createAdminSupabaseClient();

  // If user exists and we have admin client, issue instant magic link / session
  if (existingProfile && adminClient) {
    const { data: userData } = await adminClient.auth.admin.getUserById(existingProfile.id);
    if (userData?.user?.email) {
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: userData.user.email,
        options: {
          redirectTo: `${origin}${next}`,
        },
      });

      if (!linkError && linkData?.properties?.hashed_token) {
        // Direct server-side OTP exchange: sets session cookies directly into the response
        // and eliminates exposing any tokens in the browser search/address bar!
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: linkData.properties.hashed_token,
          type: "email",
        });

        if (!verifyError) {
          // Zero tokens in the URL: clean, direct redirect to destination
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Secondary server-safe fallback: route via /auth/callback using token_hash query param
        return NextResponse.redirect(
          `${origin}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=email&next=${encodeURIComponent(next)}`
        );
      }

      if (!linkError && linkData?.properties?.action_link) {
        return NextResponse.redirect(linkData.properties.action_link);
      }
    }
  }

  // If user profile is not found or needs email confirmation,
  // store temporary verified ORCID claims in a secure cookie and route to Onboarding
  cookieStore.set(
    "quazion_orcid_pending",
    JSON.stringify({
      orcid,
      name: name || "",
      scope: scope || "/authenticate",
      timestamp: Date.now(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30 minutes
    }
  );

  return NextResponse.redirect(`${origin}/auth/orcid/onboard?next=${encodeURIComponent(next)}`);
}
