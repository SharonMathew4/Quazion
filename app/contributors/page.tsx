import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editorial Board & Contributors Directory — QUAZION",
  description: "Discover verified researchers, review editors, and faculty publishing on QUAZION.",
};

export default async function ContributorsPage() {
  let contributors: Profile[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data: dbProfiles } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, affiliation, orcid, role, created_at")
      .order("created_at", { ascending: false });

    if (dbProfiles) {
      contributors = dbProfiles.map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url || undefined,
        bio: p.bio || undefined,
        affiliation: p.affiliation || undefined,
        orcid: p.orcid || undefined,
        role: (p.role as Profile["role"]) || "CREATOR",
        createdAt: p.created_at,
        totalPublications: 0,
      }));
    }
  } catch {
    contributors = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      {/* Title & Masthead */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 mb-2">
          <Users className="w-4 h-4 text-rose-700" />
          <span>Editorial Board &amp; Principal Investigators</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Contributors &amp; Verified Faculty
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
          Directory of academic researchers, reviewing editors, and authors contributing peer-moderated studies, proofs, and observational datasets to the QUAZION Open Science Archive.
        </p>
      </div>

      {/* Grid of Contributors */}
      {contributors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((author) => (
            <div
              key={author.id}
              className="academic-card p-6 rounded-md bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-base font-bold text-slate-800 overflow-hidden shrink-0">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
                    ) : (
                      author.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      <Link href={`/contributors/${author.username}`} className="hover:text-rose-700 transition-colors">
                        {author.displayName}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      @{author.username}
                    </p>
                  </div>
                </div>

                {author.affiliation && (
                  <p className="text-xs text-slate-700 font-semibold mb-2">
                    {author.affiliation}
                  </p>
                )}

                {author.orcid && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-mono mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A6CE39] inline-block" />
                    <span>ORCID: {author.orcid}</span>
                  </div>
                )}

                {author.bio && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-sans">
                    {author.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                  {author.role}
                </span>
                <Link
                  href={`/contributors/${author.username}`}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 group"
                >
                  <span>Faculty profile</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="academic-card rounded-md p-12 text-center border border-dashed border-slate-300 bg-white space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No public contributor records yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sign in with ORCID or institutional credentials to join the directory and submit manuscripts.
          </p>
          <Link href="/auth/login?mode=signup">
            <Button variant="primary" size="sm">Register Researcher Identity</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
