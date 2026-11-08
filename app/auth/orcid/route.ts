import { NextResponse } from "next/server";
import { getOrcidConfig, getOrcidAuthorizeUrl } from "@/lib/orcid";
import { cookies } from "next/headers";

/**
 * Initiates the 3-legged OAuth 2.0 flow for ORCID.
 * Generates an anti-CSRF state token and redirects to the ORCID authorization server.
 *
 * Query Params:
 * - mode: 'login' | 'link' (default 'login')
 * - next: URL to redirect after successful authentication
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const mode = searchParams.get("mode") === "link" ? "link" : "login";
  const rawNext = searchParams.get("next") || "/creator/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/creator/dashboard";

  const config = getOrcidConfig();

  // If ORCID client ID is missing, provide actionable guidance back to login
  if (!config.clientId) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=orcid_not_configured`
    );
  }

  // Generate cryptographically strong random state token for anti-CSRF
  const csrfToken = crypto.randomUUID();
  const statePayload = JSON.stringify({
    csrf: csrfToken,
    mode,
    next,
    timestamp: Date.now(),
  });

  const state = Buffer.from(statePayload).toString("base64url");
  const redirectUri = `${origin}/auth/orcid/callback`;
  const authorizeUrl = getOrcidAuthorizeUrl({ state, redirectUri });

  const cookieStore = await cookies();
  cookieStore.set("quazion_orcid_state", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  return NextResponse.redirect(authorizeUrl);
}
