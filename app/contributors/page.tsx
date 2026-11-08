import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contributors Directory — QUAZION",
  description: "Discover researchers, educators, and authors publishing on QUAZION.",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 mb-2">
          <Users className="w-4 h-4" />
          <span>Scientific Community</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          Contributors &amp; Researchers
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
          Discover scientists, mathematicians, and educational writers sharing open discoveries and knowledge across QUAZION.
        </p>
      </div>

      {/* Grid of Contributors */}
      {contributors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((author) => (
            <div
              key={author.id}
              className="cosmic-card p-6 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-mono text-sky-400 font-bold overflow-hidden">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.displayName} className="w-full h-full object-cover" />
                    ) : (
                      author.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">
                      {author.displayName}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      @{author.username}
                    </p>
                  </div>
                </div>

                {author.affiliation && (
                  <p className="text-xs text-sky-400/90 font-medium mb-3">
                    {author.affiliation}
                  </p>
                )}

                {author.bio && (
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed mb-6">
                    {author.bio}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">
                  {author.role}
                </span>
                <Link
                  href={`/contributors/${author.username}`}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 group"
                >
                  <span>View profile</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cosmic-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No public contributors yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create an account in Creator Studio to join the scientific community and publish research.
          </p>
          <Link href="/auth/login?mode=signup">
            <Button size="sm">Create Researcher Account</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
