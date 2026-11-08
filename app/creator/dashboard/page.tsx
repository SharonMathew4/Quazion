"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Eye,
  Heart,
  Download,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  AlertCircle,
  Pencil,
  X,
  Check,
  MapPin,
  Building,
  Globe,
  BookOpen,
  GraduationCap,
  Briefcase,
  Sparkles,
  Users,
  UserCheck,
  Bookmark,
  Calendar,
  LinkIcon,
  Award,
  TrendingUp,
  Star,
  Share2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMonthYear } from "@/lib/utils";
import {
  EducationEntry,
  ExperienceEntry,
  SocialLinks,
} from "@/types";

/* ─────────────── Type Definitions ─────────────── */

interface CreatorPublication {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  publication_type: string;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REVISION_REQUIRED" | "REJECTED" | "ARCHIVED";
  views_count: number;
  likes_count: number;
  downloads_count: number;
  created_at: string;
  published_at: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  headline: string | null;
  about: string | null;
  affiliation: string | null;
  location: string | null;
  website: string | null;
  orcid: string | null;
  role: string;
  skills: string[] | null;
  interests: string[] | null;
  education: EducationEntry[] | null;
  experience: ExperienceEntry[] | null;
  social_links: SocialLinks | null;
  followers_count: number;
  following_count: number;
  created_at: string;
}

type DashboardTab = "publications" | "liked" | "saved" | "about";

/* ─────────────── Inline Edit Textarea ─────────────── */

function InlineTextArea({
  value,
  placeholder,
  onSave,
  rows = 3,
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  rows?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div className="group relative">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans min-h-[20px]">
          {value || <span className="text-slate-500 italic">{placeholder}</span>}
        </p>
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="absolute top-0 right-0 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => { onSave(draft); setEditing(false); }}
          className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 transition-colors flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-slate-200 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Editable Tag List (Skills, Interests) ─────────────── */

function EditableTagList({
  tags,
  label,
  icon: Icon,
  color,
  onSave,
}: {
  tags: string[];
  label: string;
  icon: React.ElementType;
  color: string;
  onSave: (tags: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tags.join(", "));

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-center justify-between mb-2">
          <h4 className={`text-xs font-mono uppercase tracking-wider ${color} flex items-center gap-1.5 font-semibold`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </h4>
          <button
            onClick={() => { setDraft(tags.join(", ")); setEditing(true); }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">Click edit to add {label.toLowerCase()}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className={`text-xs font-mono uppercase tracking-wider ${color} flex items-center gap-1.5 font-semibold`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </h4>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Separate with commas: Machine Learning, Quantum Computing, ..."
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const parsed = draft.split(",").map((s) => s.trim()).filter(Boolean);
            onSave(parsed);
            setEditing(false);
          }}
          className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-slate-200 flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Experience / Education Section Editor ─────────────── */

function ExperienceSection({
  items,
  onSave,
}: {
  items: ExperienceEntry[];
  onSave: (items: ExperienceEntry[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ExperienceEntry[]>(items);

  const addItem = () => {
    setDraft([...draft, { title: "", organization: "", description: "", current: false }]);
  };

  const updateItem = (idx: number, field: keyof ExperienceEntry, value: string | number | boolean) => {
    const updated = [...draft];
    updated[idx] = { ...updated[idx], [field]: value };
    setDraft(updated);
  };

  const removeItem = (idx: number) => {
    setDraft(draft.filter((_, i) => i !== idx));
  };

  if (!editing) {
    return (
      <div className="group space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience</span>
          </h4>
          <button
            onClick={() => { setDraft(items); setEditing(true); }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((exp, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-100">{exp.title || "Position"}</h5>
                  <p className="text-xs text-slate-400">{exp.organization || "Organization"}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {exp.startYear || "?"} – {exp.current ? "Present" : exp.endYear || "?"}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No experience listed yet. Click edit to add.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-semibold">
        <Briefcase className="w-3.5 h-3.5" />
        <span>Experience</span>
      </h4>

      {draft.map((exp, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 relative">
          <button
            onClick={() => removeItem(idx)}
            className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            placeholder="Title (e.g., Postdoctoral Researcher)"
            value={exp.title}
            onChange={(e) => updateItem(idx, "title", e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Organization (e.g., CERN)"
            value={exp.organization}
            onChange={(e) => updateItem(idx, "organization", e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Start Year"
              value={exp.startYear || ""}
              onChange={(e) => updateItem(idx, "startYear", parseInt(e.target.value) || 0)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="number"
              placeholder="End Year"
              value={exp.endYear || ""}
              onChange={(e) => updateItem(idx, "endYear", parseInt(e.target.value) || 0)}
              disabled={!!exp.current}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={!!exp.current}
              onChange={(e) => updateItem(idx, "current", e.target.checked)}
              className="rounded border-slate-700"
            />
            Currently working here
          </label>
          <textarea
            placeholder="Brief description (optional)"
            value={exp.description || ""}
            onChange={(e) => updateItem(idx, "description", e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          />
        </div>
      ))}

      <button onClick={addItem} className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">
        <Plus className="w-3 h-3" /> Add Experience
      </button>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => { onSave(draft.filter((e) => e.title.trim())); setEditing(false); }}
          className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-slate-200 flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

function EducationSection({
  items,
  onSave,
}: {
  items: EducationEntry[];
  onSave: (items: EducationEntry[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EducationEntry[]>(items);

  const addItem = () => {
    setDraft([...draft, { institution: "", degree: "", field: "" }]);
  };

  const updateItem = (idx: number, field: keyof EducationEntry, value: string | number) => {
    const updated = [...draft];
    updated[idx] = { ...updated[idx], [field]: value };
    setDraft(updated);
  };

  const removeItem = (idx: number) => {
    setDraft(draft.filter((_, i) => i !== idx));
  };

  if (!editing) {
    return (
      <div className="group space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
          </h4>
          <button
            onClick={() => { setDraft(items); setEditing(true); }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((edu, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-100">{edu.institution || "Institution"}</h5>
                  <p className="text-xs text-slate-400">{edu.degree} in {edu.field}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {edu.startYear || "?"} – {edu.endYear || "?"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No education listed yet. Click edit to add.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-semibold">
        <GraduationCap className="w-3.5 h-3.5" />
        <span>Education</span>
      </h4>

      {draft.map((edu, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 relative">
          <button
            onClick={() => removeItem(idx)}
            className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            placeholder="Institution (e.g., Massachusetts Institute of Technology)"
            value={edu.institution}
            onChange={(e) => updateItem(idx, "institution", e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Degree (e.g., PhD)"
              value={edu.degree}
              onChange={(e) => updateItem(idx, "degree", e.target.value)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="text"
              placeholder="Field (e.g., Quantum Physics)"
              value={edu.field}
              onChange={(e) => updateItem(idx, "field", e.target.value)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Start Year"
              value={edu.startYear || ""}
              onChange={(e) => updateItem(idx, "startYear", parseInt(e.target.value) || 0)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <input
              type="number"
              placeholder="End Year"
              value={edu.endYear || ""}
              onChange={(e) => updateItem(idx, "endYear", parseInt(e.target.value) || 0)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      ))}

      <button onClick={addItem} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
        <Plus className="w-3 h-3" /> Add Education
      </button>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => { onSave(draft.filter((e) => e.institution.trim())); setEditing(false); }}
          className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1 rounded-lg border border-slate-700 text-slate-400 text-xs hover:text-slate-200 flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD PAGE — LinkedIn-Style Researcher Profile
   ═══════════════════════════════════════════════════════════════════ */

function CreatorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "orcid_linked") {
      setSuccessMessage("ORCID iD successfully verified and linked via OAuth 2.0!");
    } else if (searchParams.get("error") === "orcid_already_linked") {
      setErrorMessage("This ORCID iD is already linked to another researcher profile.");
    }
  }, [searchParams]);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [publications, setPublications] = useState<CreatorPublication[]>([]);
  const [likedPubIds, setLikedPubIds] = useState<string[]>([]);
  const [savedPubIds, setSavedPubIds] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<DashboardTab>("publications");
  const [pubFilter, setPubFilter] = useState<"all" | "published" | "drafts">("all");

  // Editable single-line fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");

  /* ─── Load Data ─── */
  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login?next=/creator/dashboard");
          return;
        }
        setUserId(user.id);

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        let currentProfile: UserProfile;

        if (profileData) {
          currentProfile = profileData as UserProfile;
        } else {
          // Self-heal: Automatically create and persist profile for authenticated user
          const meta = user.user_metadata || {};
          const emailPrefix = user.email ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : `user_${user.id.slice(0, 8)}`;
          const fallbackUsername = meta.username || emailPrefix || `user_${user.id.slice(0, 8)}`;
          const fallbackName = meta.display_name || meta.full_name || meta.name || user.email?.split("@")[0] || "Researcher";
          const fallbackAffiliation = meta.affiliation || null;

          currentProfile = {
            id: user.id,
            username: fallbackUsername,
            display_name: fallbackName,
            avatar_url: meta.avatar_url || meta.picture || null,
            banner_url: null,
            bio: null,
            headline: fallbackAffiliation ? `Researcher at ${fallbackAffiliation}` : "Scientific Contributor & Author",
            about: null,
            affiliation: fallbackAffiliation,
            location: null,
            website: null,
            orcid: null,
            role: "CREATOR",
            skills: [],
            interests: [],
            education: [],
            experience: [],
            social_links: {},
            followers_count: 0,
            following_count: 0,
            created_at: new Date().toISOString(),
          };

          // Try to persist to database
          try {
            await supabase.from("profiles").upsert(
              {
                id: user.id,
                username: fallbackUsername,
                display_name: fallbackName,
                affiliation: fallbackAffiliation || undefined,
                role: "CREATOR",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          } catch (e) {
            console.warn("Could not upsert profile to DB, using in-memory state:", e);
          }
        }

        setProfile(currentProfile);

        // Fetch publications
        const { data: pubData, error: pubError } = await supabase
          .from("publications")
          .select(`
            id, title, slug, abstract, publication_type, status,
            views_count, likes_count, downloads_count,
            created_at, published_at,
            category:categories(id, name, slug)
          `)
          .eq("author_id", user.id)
          .order("created_at", { ascending: false });

        if (pubError) {
          setErrorMessage(pubError.message);
        } else if (pubData) {
          interface RawDashboardItem extends Omit<CreatorPublication, "category"> {
            category?: CreatorPublication["category"] | CreatorPublication["category"][];
          }
          const normalized: CreatorPublication[] = (pubData as unknown as RawDashboardItem[]).map((item) => ({
            ...item,
            category: Array.isArray(item.category) ? item.category[0] : item.category || { id: "gen", name: "General Science", slug: "general" },
          }));
          setPublications(normalized);
        }

        // Fetch liked publication IDs
        const { data: likesData } = await supabase
          .from("publication_likes")
          .select("publication_id")
          .eq("user_id", user.id);
        if (likesData) {
          setLikedPubIds(likesData.map((l) => l.publication_id));
        }

        // Try fetching saved publications
        const { data: savedData } = await supabase
          .from("saved_publications")
          .select("publication_id")
          .eq("user_id", user.id);
        if (savedData) {
          setSavedPubIds(savedData.map((s) => s.publication_id));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard.";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router, supabase]);

  /* ─── Save Profile Field ─── */
  const saveProfileField = useCallback(async (field: string, value: string | string[] | EducationEntry[] | ExperienceEntry[] | SocialLinks) => {
    if (!userId) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        setErrorMessage(`Failed to save ${field}: ${error.message}`);
      } else {
        setProfile((prev) => prev ? { ...prev, [field]: value } as UserProfile : prev);
        setSuccessMessage("Profile updated!");
        setTimeout(() => setSuccessMessage(null), 2000);
      }
    } catch {
      setErrorMessage("Unexpected error saving profile.");
    } finally {
      setSaving(false);
    }
  }, [userId, supabase]);

  const saveInlineField = (field: string) => {
    saveProfileField(field, fieldDraft);
    setEditingField(null);
  };

  /* ─── Delete Publication ─── */
  const handleDeletePublication = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const { error } = await supabase.from("publications").delete().eq("id", id);
      if (error) {
        alert(`Failed to delete: ${error.message}`);
      } else {
        setPublications((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  /* ─── Derived Data ─── */
  const filteredPubs = publications.filter((p) => {
    if (pubFilter === "published") return p.status === "PUBLISHED";
    if (pubFilter === "drafts") return p.status === "DRAFT";
    return true;
  });

  const totalViews = publications.reduce((a, p) => a + (p.views_count || 0), 0);
  const totalLikes = publications.reduce((a, p) => a + (p.likes_count || 0), 0);
  const totalDownloads = publications.reduce((a, p) => a + (p.downloads_count || 0), 0);
  const publishedCount = publications.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = publications.filter((p) => p.status === "DRAFT").length;

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="cosmic-card p-8 rounded-2xl flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          <span>Loading your researcher profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="cosmic-card p-8 rounded-2xl text-center space-y-4 max-w-md">
          <Sparkles className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-100">Welcome to Creator Studio</h3>
          <p className="text-xs text-slate-400">
            Your authenticated session is active. Click below to load your researcher profile.
          </p>
          <Button
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Load Profile
          </Button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-0">

      {/* ══════ PROFILE BANNER ══════ */}
      <div className="relative h-48 sm:h-56 rounded-b-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950/50 to-indigo-950/40 border-b border-slate-800">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-slate-950 to-indigo-900/20">
            <div className="absolute top-6 right-8 w-40 h-40 bg-sky-500/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-4 left-12 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
          </div>
        )}
        {/* Banner edit hint */}
        <div className="absolute bottom-3 right-4 opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-1 rounded flex items-center gap-1">
            <Camera className="w-3 h-3" /> Edit banner
          </span>
        </div>
      </div>

      {/* ══════ PROFILE HEADER CARD ══════ */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="cosmic-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-5">
          {/* Avatar + Core Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 text-3xl font-extrabold text-white font-mono">
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-slate-950" />
              </span>
            </div>

            {/* Name, headline, meta */}
            <div className="flex-1 space-y-1.5 min-w-0">
              {/* Display Name */}
              <div className="flex items-center gap-3 flex-wrap">
                {editingField === "display_name" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fieldDraft}
                      onChange={(e) => setFieldDraft(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-lg font-bold text-slate-100 focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                    <button onClick={() => saveInlineField("display_name")} className="text-sky-400 hover:text-sky-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingField(null)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight cursor-pointer hover:text-sky-300 transition-colors"
                    onClick={() => { setFieldDraft(profile.display_name); setEditingField("display_name"); }}
                    title="Click to edit name"
                  >
                    {profile.display_name}
                  </h1>
                )}
                <Badge variant="accent" className="font-mono text-[10px]">{profile.role}</Badge>
              </div>

              {/* Headline (editable inline) */}
              {editingField === "headline" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fieldDraft}
                    onChange={(e) => setFieldDraft(e.target.value)}
                    placeholder="e.g., Postdoctoral Fellow in Quantum Information Science"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    autoFocus
                  />
                  <button onClick={() => saveInlineField("headline")} className="text-sky-400 hover:text-sky-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingField(null)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <p
                  className="text-sm text-slate-300 cursor-pointer hover:text-sky-300 transition-colors"
                  onClick={() => { setFieldDraft(profile.headline || ""); setEditingField("headline"); }}
                  title="Click to edit headline"
                >
                  {profile.headline || <span className="text-slate-500 italic">Add a professional headline...</span>}
                </p>
              )}

              {/* Meta Tags Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                {profile.affiliation && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {profile.affiliation}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-400 hover:text-sky-300">
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
                {profile.orcid ? (
                  <a
                    href={`https://orcid.org/${profile.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ORCID: {profile.orcid}</span>
                  </a>
                ) : (
                  <Link
                    href="/auth/orcid?mode=link&next=/creator/dashboard"
                    className="flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 hover:border-emerald-500/40"
                  >
                    <Award className="w-3 h-3 text-[#A6CE39]" />
                    <span>Connect ORCID</span>
                  </Link>
                )}
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3" />
                  Joined {formatMonthYear(profile.created_at)}
                </span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 sm:self-start sm:mt-4">
              <Link href="/creator/publications/new">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5 font-semibold">
                  <Plus className="w-4 h-4" />
                  <span>New Publication</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setActiveTab("about")}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">{profile.bio}</p>
          )}

          {/* Social Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-4 h-4 text-sky-400" />
              <strong className="text-slate-100">{(profile.followers_count || 0).toLocaleString()}</strong> Followers
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <strong className="text-slate-100">{(profile.following_count || 0).toLocaleString()}</strong> Following
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <strong className="text-slate-100">{publishedCount}</strong> Publications
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Eye className="w-4 h-4 text-slate-400" />
              <strong className="text-slate-100">{totalViews.toLocaleString()}</strong> Views
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Heart className="w-4 h-4 text-rose-400" />
              <strong className="text-slate-100">{totalLikes.toLocaleString()}</strong> Likes
            </span>
          </div>
        </div>
      </div>

      {/* ══════ TOAST MESSAGES ══════ */}
      {errorMessage && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {successMessage && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ══════ MAIN CONTENT AREA: Tabs + Body ══════ */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto">
          {([
            { id: "publications" as const, label: "Publications", icon: FileText, count: publications.length },
            { id: "liked" as const, label: "Liked Papers", icon: Heart, count: likedPubIds.length },
            { id: "saved" as const, label: "Saved / Library", icon: Bookmark, count: savedPubIds.length },
            { id: "about" as const, label: "About & Profile", icon: BookOpen },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-sky-400 text-sky-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300 font-mono">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ TAB: Publications ═══ */}
        {activeTab === "publications" && (
          <div className="space-y-4">
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Papers", value: publications.length, sub: `${draftCount} drafts`, icon: FileText, color: "text-sky-400" },
                { label: "Total Views", value: totalViews, sub: "Across all papers", icon: Eye, color: "text-indigo-400" },
                { label: "Likes Received", value: totalLikes, sub: "Community appreciation", icon: Heart, color: "text-rose-400" },
                { label: "Downloads", value: totalDownloads, sub: "PDF accesses", icon: Download, color: "text-emerald-400" },
              ].map((m) => (
                <div key={m.label} className="cosmic-card p-4 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="text-[11px] font-mono">{m.label}</span>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="text-xl font-bold text-slate-100 font-mono">{m.value.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Sub-filter */}
            <div className="flex items-center gap-2 text-xs font-mono">
              {(["all", "published", "drafts"] as const).map((f) => {
                const cnt = f === "all" ? publications.length : f === "published" ? publishedCount : draftCount;
                return (
                  <button
                    key={f}
                    onClick={() => setPubFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pubFilter === f ? "bg-slate-800 text-sky-400 font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)} ({cnt})
                  </button>
                );
              })}
            </div>

            {/* Publication List */}
            {filteredPubs.length > 0 ? (
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                {filteredPubs.map((pub) => (
                  <div
                    key={pub.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/70 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={pub.status === "PUBLISHED" ? "success" : "warning"}>{pub.status}</Badge>
                        <span className="text-[11px] text-slate-500 font-mono">{pub.category?.name || "General"} • {pub.publication_type}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{pub.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>{formatDate(pub.created_at)}</span>
                        {pub.status === "PUBLISHED" && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{pub.views_count}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{pub.likes_count}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{pub.downloads_count}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/creator/publications/${pub.id}/edit`}>
                        <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                      </Link>
                      {pub.status === "PUBLISHED" ? (
                        <Link href={`/publications/${pub.slug}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-mono px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/20">Draft</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePublication(pub.id, pub.title)}
                        title="Delete"
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cosmic-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200 mb-1">No manuscripts found</h3>
                <p className="text-xs text-slate-400 mb-4">You haven&apos;t created any publications or drafts yet.</p>
                <Link href="/creator/publications/new">
                  <Button variant="primary" size="sm" className="inline-flex items-center gap-2 font-semibold">
                    <Plus className="w-4 h-4" /> Create your first publication
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Liked Papers ═══ */}
        {activeTab === "liked" && (
          <div className="cosmic-card rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-3">
            <Heart className="w-10 h-10 text-rose-400/50 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">Papers You&apos;ve Liked</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {likedPubIds.length > 0
                ? `You have liked ${likedPubIds.length} publication${likedPubIds.length > 1 ? "s" : ""}. Browse the feed to discover and like more research.`
                : "Like papers from the feed or publications page and they will appear here for quick access."}
            </p>
            <Link href="/publications">
              <Button variant="outline" size="sm" className="flex items-center gap-2 mx-auto mt-2">
                <TrendingUp className="w-4 h-4" /> Browse Publications
              </Button>
            </Link>
          </div>
        )}

        {/* ═══ TAB: Saved / Library ═══ */}
        {activeTab === "saved" && (
          <div className="cosmic-card rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-3">
            <Bookmark className="w-10 h-10 text-amber-400/50 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">Your Reading Library</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {savedPubIds.length > 0
                ? `You have saved ${savedPubIds.length} paper${savedPubIds.length > 1 ? "s" : ""} to your personal reading library.`
                : "Bookmark papers from the feed to build your personal scientific reading library."}
            </p>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2 mx-auto mt-2">
                <Star className="w-4 h-4" /> Explore Feed
              </Button>
            </Link>
          </div>
        )}

        {/* ═══ TAB: About & Full Profile Editor ═══ */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* About / Description */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>About</span>
                </h3>
                <InlineTextArea
                  value={profile.about || ""}
                  placeholder="Write about your research focus, scientific philosophy, and academic journey..."
                  onSave={(v) => saveProfileField("about", v)}
                  rows={5}
                />
              </div>

              {/* Experience */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800">
                <ExperienceSection
                  items={profile.experience || []}
                  onSave={(items) => saveProfileField("experience", items)}
                />
              </div>

              {/* Education */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800">
                <EducationSection
                  items={profile.education || []}
                  onSave={(items) => saveProfileField("education", items)}
                />
              </div>

              {/* Skills */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800">
                <EditableTagList
                  tags={profile.skills || []}
                  label="Skills & Expertise"
                  icon={Sparkles}
                  color="text-amber-400"
                  onSave={(tags) => saveProfileField("skills", tags)}
                />
              </div>

              {/* Interests */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800">
                <EditableTagList
                  tags={profile.interests || []}
                  label="Research Interests"
                  icon={Star}
                  color="text-indigo-400"
                  onSave={(tags) => saveProfileField("interests", tags)}
                />
              </div>
            </div>

            {/* Right Column: Quick Edit Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Quick Profile Fields */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Profile Details</h4>

                {([
                  { key: "display_name", label: "Display Name", icon: Users, value: profile.display_name },
                  { key: "username", label: "Username", icon: Users, value: profile.username },
                  { key: "headline", label: "Headline", icon: Briefcase, value: profile.headline || "" },
                  { key: "affiliation", label: "Affiliation", icon: Building, value: profile.affiliation || "" },
                  { key: "location", label: "Location", icon: MapPin, value: profile.location || "" },
                  { key: "bio", label: "Short Bio", icon: FileText, value: profile.bio || "" },
                  { key: "website", label: "Website", icon: Globe, value: profile.website || "" },
                ] as const).map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <field.icon className="w-3 h-3" />
                      {field.label}
                    </label>
                    {editingField === `sidebar_${field.key}` ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={fieldDraft}
                          onChange={(e) => setFieldDraft(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") { saveProfileField(field.key, fieldDraft); setEditingField(null); } }}
                        />
                        <button onClick={() => { saveProfileField(field.key, fieldDraft); setEditingField(null); }} className="text-sky-400 hover:text-sky-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingField(null)} className="text-slate-500"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div
                        className="text-xs text-slate-300 bg-slate-950/40 rounded-lg px-2.5 py-1.5 border border-slate-800/60 cursor-pointer hover:border-sky-500/40 transition-colors min-h-[28px] flex items-center"
                        onClick={() => { setFieldDraft(field.value); setEditingField(`sidebar_${field.key}`); }}
                      >
                        {field.value || <span className="text-slate-500 italic">Click to add...</span>}
                      </div>
                    )}
                  </div>
                ))}

                {/* ORCID Academic Verification Widget */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 font-semibold">
                      <div className="w-4 h-4 rounded bg-[#A6CE39] text-slate-950 font-bold text-[9px] flex items-center justify-center">
                        iD
                      </div>
                      <span>ORCID Identity</span>
                    </label>
                    {profile.orcid ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        OAuth Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        Unlinked
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    {profile.orcid ? (
                      <div>
                        <div className="font-mono text-slate-200 text-xs">
                          {profile.orcid}
                        </div>
                        <a
                          href={`https://orcid.org/${profile.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>View on orcid.org</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Connect your authenticated ORCID iD to claim publication credits and verify your researcher identity.
                      </p>
                    )}

                    <Link
                      href="/auth/orcid?mode=link&next=/creator/dashboard"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-colors bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{profile.orcid ? "Re-authorize ORCID" : "Link ORCID iD"}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="cosmic-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Social Links</span>
                </h4>

                {([
                  { key: "twitter" as const, label: "Twitter / X" },
                  { key: "github" as const, label: "GitHub" },
                  { key: "linkedin" as const, label: "LinkedIn" },
                  { key: "googleScholar" as const, label: "Google Scholar" },
                  { key: "researchGate" as const, label: "ResearchGate" },
                ]).map((link) => {
                  const currentLinks = profile.social_links || {};
                  const val = currentLinks[link.key] || "";

                  return (
                    <div key={link.key} className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500">{link.label}</label>
                      {editingField === `social_${link.key}` ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={fieldDraft}
                            onChange={(e) => setFieldDraft(e.target.value)}
                            placeholder={`https://${link.key}.com/...`}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              const updated = { ...currentLinks, [link.key]: fieldDraft || undefined };
                              saveProfileField("social_links", updated);
                              setEditingField(null);
                            }}
                            className="text-sky-400 hover:text-sky-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingField(null)} className="text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div
                          className="text-xs text-slate-400 bg-slate-950/40 rounded-lg px-2.5 py-1.5 border border-slate-800/60 cursor-pointer hover:border-sky-500/40 transition-colors truncate"
                          onClick={() => { setFieldDraft(val); setEditingField(`social_${link.key}`); }}
                        >
                          {val || <span className="text-slate-500 italic">Add link...</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Share Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/30 via-slate-900 to-indigo-950/20 border border-sky-500/20 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-semibold">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Your Profile</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your public profile is visible at:
                </p>
                <code className="block text-[11px] text-sky-300 bg-slate-950/60 px-2 py-1 rounded font-mono truncate">
                  /contributors/{profile.username}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-sky-500/30 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-sky-400 font-mono shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
}

export default function CreatorDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="cosmic-card p-8 rounded-2xl flex items-center gap-3 text-slate-400 font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span>Loading Researcher Studio...</span>
          </div>
        </div>
      }
    >
      <CreatorDashboardContent />
    </Suspense>
  );
}
