"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { PublicationType, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/publications/math-renderer";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Plus, 
  Trash2,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const PUBLICATION_TYPES: PublicationType[] = [
  "Research Paper",
  "Review Article",
  "Scientific Note",
  "Research Report",
  "Observation Report",
  "Educational Article",
  "Tutorial",
  "Lecture Note",
  "Editorial",
  "Science Essay",
  "Commentary",
];

export default function NewPublicationPage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth & Category loading state
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publicationType, setPublicationType] = useState<PublicationType>("Research Paper");
  const [categoryId, setCategoryId] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [references, setReferences] = useState<Array<{ title: string; authors: string; year: string; source: string }>>([
    { title: "", authors: "", year: "", source: "" },
  ]);

  // Preview & Submit State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"draft" | "publish" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verify auth session & load categories on mount
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login?next=/creator/publications/new");
          return;
        }
        setCurrentUser(user);

        // Fetch categories from Supabase
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, slug, description, icon_name")
          .order("name");

        if (catData && catData.length > 0) {
          setCategories(catData as Category[]);
          setCategoryId(catData[0].id);
        } else if (MOCK_CATEGORIES.length > 0) {
          setCategories(MOCK_CATEGORIES);
          setCategoryId(MOCK_CATEGORIES[0].id);
        }
      } catch (err) {
        console.warn("Failed to load initial publishing data:", err);
      } finally {
        setLoadingAuth(false);
      }
    }
    init();
  }, [router, supabase]);

  // Auto-generate URL slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleAddReference = () => {
    setReferences([...references, { title: "", authors: "", year: "", source: "" }]);
  };

  const handleRemoveReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const savePublication = async (isPublish: boolean) => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a manuscript title.");
      return;
    }
    if (!abstract.trim()) {
      setErrorMessage("Please provide an abstract summary.");
      return;
    }
    if (isPublish && !content.trim()) {
      setErrorMessage("Cannot publish an empty manuscript. Please add manuscript content.");
      return;
    }

    if (!currentUser) {
      router.push("/auth/login?next=/creator/publications/new");
      return;
    }

    setIsSubmitting(true);
    setSubmitAction(isPublish ? "publish" : "draft");

    try {
      // 1. Ensure author profile exists in profiles table
      const userMeta = currentUser.user_metadata || {};
      const fallbackName = userMeta.display_name || userMeta.full_name || currentUser.email?.split("@")[0] || "Researcher";
      const fallbackUsername = userMeta.username || currentUser.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${currentUser.id.slice(0, 8)}`;

      await supabase.from("profiles").upsert(
        {
          id: currentUser.id,
          username: fallbackUsername,
          display_name: fallbackName,
          role: "CREATOR",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      // 2. Compute metadata
      let finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (!finalSlug) {
        finalSlug = `manuscript-${Date.now().toString(36)}`;
      }

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const keywordsArray = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const selectedCatId = categoryId || (categories[0] ? categories[0].id : null);
      if (!selectedCatId) {
        setErrorMessage("Please select a scientific category.");
        setIsSubmitting(false);
        return;
      }

      const publicationStatus = isPublish ? "PUBLISHED" : "DRAFT";

      // 3. Attempt insert into publications
      let insertResult = await supabase
        .from("publications")
        .insert({
          title: title.trim(),
          slug: finalSlug,
          abstract: abstract.trim(),
          content: content.trim() || null,
          publication_type: publicationType,
          category_id: selectedCatId,
          author_id: currentUser.id,
          status: publicationStatus,
          tags: tagsArray,
          keywords: keywordsArray,
          reading_time_minutes: readingTime,
          published_at: isPublish ? new Date().toISOString() : null,
        })
        .select()
        .single();

      // If duplicate slug error, retry with unique suffix
      if (insertResult.error && insertResult.error.code === "23505") {
        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
        insertResult = await supabase
          .from("publications")
          .insert({
            title: title.trim(),
            slug: finalSlug,
            abstract: abstract.trim(),
            content: content.trim() || null,
            publication_type: publicationType,
            category_id: selectedCatId,
            author_id: currentUser.id,
            status: publicationStatus,
            tags: tagsArray,
            keywords: keywordsArray,
            reading_time_minutes: readingTime,
            published_at: isPublish ? new Date().toISOString() : null,
          })
          .select()
          .single();
      }

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      const newPubId = insertResult.data.id;

      // 4. Insert bibliographic references if provided
      const validRefs = references
        .filter((r) => r.title.trim())
        .map((r, index) => ({
          publication_id: newPubId,
          order_index: index,
          title: r.title.trim(),
          authors: r.authors.trim() || "Anonymous",
          year: r.year ? parseInt(r.year, 10) || null : null,
          source: r.source.trim() || null,
        }));

      if (validRefs.length > 0) {
        await supabase.from("publication_references").insert(validRefs);
      }

      // Redirect to creator dashboard
      router.push("/creator/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save publication.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    savePublication(false);
  };

  const handleSubmitForPublish = (e: React.FormEvent) => {
    e.preventDefault();
    savePublication(true);
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId) || categories[0] || {
    id: "unknown",
    name: "General Science",
    slug: "general",
  };

  if (loadingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="cosmic-card p-8 rounded-2xl flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          <span>Verifying researcher credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors font-mono mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Publishing Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author and publish open scientific publications, research notes, and educational essays.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting && submitAction === "draft" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmitForPublish}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting && submitAction === "publish" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Publish Now</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Editor Form */}
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        
        {/* 1. Title & URL Slug */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Manuscript Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Relativistic Jet Morphology in Supermassive Black Holes"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
              URL Slug
            </label>
            <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-600">quazion.org/publications/</span>
              <span className="text-sky-400">{slug || "your-publication-slug"}</span>
            </div>
          </div>
        </div>

        {/* 2. Metadata: Category & Publication Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Scientific Discipline <span className="text-rose-400">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Publication Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={publicationType}
              onChange={(e) => setPublicationType(e.target.value as PublicationType)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {PUBLICATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Abstract */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Abstract <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500">Concise summary (100–300 words)</span>
          </div>
          <textarea
            required
            rows={4}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Summarize the core premise, methods, findings, and scientific implications..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
          />
        </div>

        {/* 4. Main Content Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Scientific Manuscript / Content <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Supports Markdown &amp; LaTeX formulas</span>
          </div>
          <textarea
            required
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write manuscript content here...&#10;&#10;## 1. Introduction&#10;Describe your background and observational or theoretical framework...&#10;&#10;## 2. Mathematical Formalism&#10;R_s = 2GM / c^2"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-slate-100 text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
          />
        </div>

        {/* 5. Tags & Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Black Holes, General Relativity, Accretion"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Search Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="singularity, metric, event horizon"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 6. References Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              Bibliographic References
            </label>
            <button
              type="button"
              onClick={handleAddReference}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reference</span>
            </button>
          </div>

          {references.map((ref, idx) => (
            <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3">
              <span className="text-xs font-mono text-slate-500 mt-2">[{idx + 1}]</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Article/Book Title"
                  value={ref.title}
                  onChange={(e) => handleReferenceChange(idx, "title", e.target.value)}
                  className="sm:col-span-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="text"
                  placeholder="Authors (e.g. Hawking, S.)"
                  value={ref.authors}
                  onChange={(e) => handleReferenceChange(idx, "authors", e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="text"
                  placeholder="Year / Source"
                  value={ref.source}
                  onChange={(e) => handleReferenceChange(idx, "source", e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5"
                />
              </div>
              {references.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveReference(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

      </form>

      {/* 7. Publication Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cosmic-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="accent">PREVIEW MODE</Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedCategoryObj.name} • {publicationType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                {title || "Untitled Manuscript"}
              </h1>

              <div className="bg-slate-900/80 border-l-4 border-sky-500 p-4 rounded-r-lg italic text-slate-300 text-sm">
                {abstract || "No abstract provided."}
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 leading-relaxed max-h-[50vh] overflow-y-auto">
                <MathRenderer content={content || "No manuscript content entered yet."} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
