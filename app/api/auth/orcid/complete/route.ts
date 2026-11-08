import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logServerError } from "@/lib/server-logger";

/**
 * Completes researcher registration for direct ORCID sign-ins.
 * Provisions Supabase Auth user, writes verified ORCID to public.profiles,
 * and sets up session.
 */
export async function POST(request: Request) {
  try {
    const { origin } = new URL(request.url);
    const cookieStore = await cookies();
    const pendingCookie = cookieStore.get("quazion_orcid_pending")?.value;

    if (!pendingCookie) {
      return NextResponse.json(
        { error: "No verified ORCID session found. Please re-authenticate." },
        { status: 400 }
      );
    }

    const { orcid, name: defaultName, scope } = JSON.parse(pendingCookie);
    const body = await request.json();
    const { email, displayName, affiliation, next = "/creator/dashboard" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid institutional email is required for journal correspondence." },
        { status: 400 }
      );
    }

    const adminClient = createAdminSupabaseClient();
    const supabase = await createServerSupabaseClient();

    const cleanDisplayName = (displayName || defaultName || "Researcher").trim();
    const cleanUsername = `${email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")}_${orcid.slice(-4)}`;

    let userId: string | null = null;
    let actionLink: string | null = null;

    if (adminClient) {
      // Create user or link if already exists
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        email_confirm: true,
        user_metadata: {
          display_name: cleanDisplayName,
          orcid,
          affiliation: affiliation || "",
        },
      });

      if (createError) {
        // If user already exists, generate a link to merge ORCID
        if (createError.message.toLowerCase().includes("already registered")) {
          const { data: linkData } = await adminClient.auth.admin.generateLink({
            type: "magiclink",
            email: email.trim().toLowerCase(),
            options: {
              redirectTo: `${origin}${next}`,
            },
          });
          
          if (linkData?.properties?.hashed_token) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: linkData.properties.hashed_token,
              type: "email",
            });
            if (!verifyError) {
              actionLink = null;
            } else {
              actionLink = linkData?.properties?.action_link || null;
            }
          } else {
            actionLink = linkData?.properties?.action_link || null;
          }
        } else {
          logServerError("ORCID_complete_UserCreation", createError);
          return NextResponse.json(
            { error: "Unable to register institutional credentials. Please verify your details." },
            { status: 400 }
          );
        }
      } else if (newUser?.user) {
        userId = newUser.user.id;
        
        // Generate immediate session link for seamless login
        const { data: linkData } = await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: email.trim().toLowerCase(),
          options: {
            redirectTo: `${origin}${next}`,
          },
        });

        if (linkData?.properties?.hashed_token) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: "email",
          });
          if (!verifyError) {
            actionLink = null;
          } else {
            actionLink = linkData?.properties?.action_link || null;
          }
        } else {
          actionLink = linkData?.properties?.action_link || null;
        }
      }
    }

    // Ensure profile row has verified ORCID
    if (userId && adminClient) {
      await adminClient.from("profiles").upsert(
        {
          id: userId,
          username: cleanUsername,
          display_name: cleanDisplayName,
          affiliation: affiliation || null,
          orcid: orcid,
          orcid_authenticated_at: new Date().toISOString(),
          orcid_scope: scope || "/authenticate",
          role: "CREATOR",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    // Clear the pending cookie
    cookieStore.delete("quazion_orcid_pending");

    return NextResponse.json({
      success: true,
      redirectUrl: actionLink || `${origin}${next}`,
    });
  } catch (err: unknown) {
    logServerError("ORCID_complete_Fatal", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during setup. Please try again." },
      { status: 500 }
    );
  }
}
