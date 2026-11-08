"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Loader2,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { getSanitizedErrorMessage } from "@/lib/security-errors";
import { EmptyState } from "@/components/ui/empty-state";
import { reportClientError } from "@/lib/client-logger";

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

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pubId = params?.id;
  const supabase = createClient();

  // Loading & Auth State
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("DRAFT");
  const [currentVersion, setCurrentVersion] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publicationType, setPublicationType] = useState<PublicationType>("Research Paper");
  const [categoryId, setCategoryId] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [changelogNotes, setChangelogNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [references, setReferences] = useState<Array<{ id?: string; title: string; authors: string; year: string; source: string }>>([]);

  // Preview & Submit State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load publication and categories on mount
  useEffect(() => {
    async function loadData() {
      if (!pubId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/auth/login?next=/creator/publications/${pubId}/edit`);
          return;
        }

        // 1. Fetch categories
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, slug, description, icon_name")
          .order("name");

        if (catData) {
          setCategories(catData as Category[]);
        }

        // 2. Fetch publication
        const { data: pubData, error: pubError } = await supabase
          .from("publications")
          .select(`
            id,
            title,
            slug,
            abstract,
            content,
            publication_type,
            category_id,
            author_id,
            status,
            tags,
            keywords,
            version,
            changelog_notes,
            references:publication_references(id, title, authors, year, source, order_index)
          `)
          .eq("id", pubId)
          .single();

        if (pubError || !pubData) {
          setErrorMessage(
            pubError
              ? getSanitizedErrorMessage(pubError, "Publication not found or inaccessible.")
              : "Publication not found."
          );
          setLoading(false);
          return;
        }

        // Author validation check
        if (pubData.author_id !== user.id) {
          setErrorMessage("Unauthorized: You are not the author of this publication.");
          setLoading(false);
          return;
        }

        // Prepopulate form fields
        setTitle(pubData.title);
        setSlug(pubData.slug);
        setPublicationType(pubData.publication_type);
        setCategoryId(pubData.category_id);
        setAbstract(pubData.abstract || "");
        setContent(pubData.content || "");
        setChangelogNotes(pubData.changelog_notes || "");
        setCurrentStatus(pubData.status);
        setCurrentVersion(pubData.version || 1);
        setTagsInput((pubData.tags || []).join(", "));
        setKeywordsInput((pubData.keywords || []).join(", "));

        interface RawRef {
          id: string;
          title: string;
          authors: string;
          year: number | null;
          source: string | null;
        }

        if (pubData.references && Array.isArray(pubData.references) && pubData.references.length > 0) {
          setReferences(
            (pubData.references as unknown as RawRef[]).map((r) => ({
              id: r.id,
              title: r.title,
              authors: r.authors,
              year: r.year ? String(r.year) : "",
              source: r.source || "",
            }))
          );
        } else {
          setReferences([{ title: "", authors: "", year: "", source: "" }]);
        }
      } catch (err: unknown) {
        reportClientError("EditPublication_LoadData", err, { pubId });
        setErrorMessage(
          getSanitizedErrorMessage(
            err,
            "Failed to load publication. Please verify the link or your permissions."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [pubId, router, supabase]);

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

  const saveUpdates = async (newStatus?: "DRAFT" | "PUBLISHED") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a manuscript title.");
      return;
    }
    if (!abstract.trim()) {
      setErrorMessage("Please provide an abstract summary.");
      return;
    }

    const finalStatus = newStatus || (currentStatus as "DRAFT" | "PUBLISHED");
    if (finalStatus === "PUBLISHED" && !content.trim()) {
      setErrorMessage("Cannot publish an empty manuscript. Please add content.");
      return;
    }

    setIsSubmitting(true);

    try {
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

      // 1. Update publication row
      const updatePayload: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        abstract: abstract.trim(),
        content: content.trim() || null,
        publication_type: publicationType,
        category_id: categoryId,
        tags: tagsArray,
        keywords: keywordsArray,
        reading_time_minutes: readingTime,
        status: finalStatus,
        changelog_notes: changelogNotes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (finalStatus === "PUBLISHED" && currentStatus !== "PUBLISHED") {
        updatePayload.published_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("publications")
        .update(updatePayload)
        .eq("id", pubId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2. Synchronize references (delete existing and re-insert)
      await supabase
        .from("publication_references")
        .delete()
        .eq("publication_id", pubId);

      const validRefs = references
        .filter((r) => r.title.trim())
        .map((r, index) => ({
          publication_id: pubId,
          order_index: index,
          title: r.title.trim(),
          authors: r.authors.trim() || "Anonymous",
          year: r.year ? parseInt(r.year, 10) || null : null,
          source: r.source.trim() || null,
        }));

      if (validRefs.length > 0) {
        await supabase.from("publication_references").insert(validRefs);
      }

      setSuccessMessage("Manuscript revisions saved successfully!");
      setCurrentStatus(finalStatus);

      setTimeout(() => {
        router.push("/creator/dashboard");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      reportClientError("EditPublication_SaveUpdates", err, { pubId });
      setErrorMessage(
        getSanitizedErrorMessage(
          err,
          "Failed to save manuscript revisions. Please check your inputs and try again."
        )
      );
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId) || {
    id: "unknown",
    name: "General Science",
    slug: "general",
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="academic-card p-8 rounded bg-white border border-slate-200 shadow-2xs flex items-center gap-3 text-slate-700 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-rose-700" />
          <span>Loading manuscript editor...</span>
        </div>
      </div>
    );
  }

  if (!title && errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 p-4">
        <EmptyState
          icon={AlertCircle}
          badge="Access Notice"
          title="Manuscript Inaccessible"
          description={errorMessage}
          primaryAction={{
            label: "Return to Creator Dashboard",
            href: "/creator/dashboard",
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-700 transition-colors font-mono mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Researcher Studio</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Edit Manuscript
            </h1>
            <Badge variant={currentStatus === "PUBLISHED" ? "success" : "warning"}>
              {currentStatus}
            </Badge>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              v{currentVersion}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Update manuscript content, mathematical theorems, references, and changelog notes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Manuscript Preview</span>
          </Button>

          {currentStatus === "DRAFT" ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => saveUpdates("DRAFT")}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Draft</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => saveUpdates("PUBLISHED")}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Publish</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => saveUpdates("PUBLISHED")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Revision (v{currentVersion + 1})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-relaxed font-sans">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span className="leading-relaxed font-sans">{successMessage}</span>
        </div>
      )}

      {/* Edit Form */}
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Title & Slug */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 space-y-4 shadow-2xs">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1.5">
              Manuscript Title <span className="text-rose-700">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 font-serif text-xl sm:text-2xl font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Permanent Identifier / URL Slug
            </label>
            <div className="flex items-center gap-1 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded border border-slate-200">
              <span className="text-slate-400">quazion.org/publications/</span>
              <span className="text-slate-900 font-semibold">{slug}</span>
            </div>
          </div>
        </div>

        {/* Category & Type */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1.5">
              Scientific Discipline <span className="text-rose-700">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-slate-500 cursor-pointer font-sans"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1.5">
              Publication Classification <span className="text-rose-700">*</span>
            </label>
            <select
              value={publicationType}
              onChange={(e) => setPublicationType(e.target.value as PublicationType)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-slate-500 cursor-pointer font-sans"
            >
              {PUBLICATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Abstract */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              Structured Abstract <span className="text-rose-700">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">150–300 words recommended</span>
          </div>
          <textarea
            required
            rows={5}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded p-3.5 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-500 leading-relaxed font-serif"
          />
        </div>

        {/* Content with KaTeX Notice */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
              Scientific Manuscript Content <span className="text-rose-700">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-rose-700" />
              <span>Supports Markdown &amp; KaTeX ($...$ and $$...$$)</span>
            </span>
          </div>
          <textarea
            required
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-300 rounded p-4 text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-slate-500 leading-relaxed"
          />
        </div>

        {/* Changelog Notes (for revisions) */}
        {currentStatus === "PUBLISHED" && (
          <div className="academic-card p-5 rounded bg-amber-50/50 border border-amber-200 space-y-1.5 shadow-2xs">
            <label className="block text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
              Revision Changelog Notes
            </label>
            <input
              type="text"
              value={changelogNotes}
              onChange={(e) => setChangelogNotes(e.target.value)}
              placeholder="e.g., Corrected metric tensor coefficient in Equation 4; added 2026 citations"
              className="w-full bg-white border border-amber-300 rounded px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>
        )}

        {/* Tags & Keywords */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1.5">
              Disciplines &amp; Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-1.5">
              Indexing Keywords (comma separated)
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3.5 py-2.5 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>
        </div>

        {/* References */}
        <div className="academic-card p-6 rounded bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                Bibliographic References
              </label>
              <p className="text-[11px] text-slate-500 font-sans">Formal citations referenced in the text</p>
            </div>
            <button
              type="button"
              onClick={handleAddReference}
              className="text-xs text-rose-700 hover:text-rose-800 flex items-center gap-1 font-mono cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Citation</span>
            </button>
          </div>

          {references.map((ref, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-3">
              <span className="text-xs font-mono text-slate-500 mt-2">[{idx + 1}]</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Article/Book Title"
                  value={ref.title}
                  onChange={(e) => handleReferenceChange(idx, "title", e.target.value)}
                  className="sm:col-span-2 bg-white border border-slate-300 text-slate-900 text-xs rounded px-2.5 py-1.5 focus:border-slate-500 font-sans"
                />
                <input
                  type="text"
                  placeholder="Authors"
                  value={ref.authors}
                  onChange={(e) => handleReferenceChange(idx, "authors", e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 text-xs rounded px-2.5 py-1.5 focus:border-slate-500 font-sans"
                />
                <input
                  type="text"
                  placeholder="Year / Source"
                  value={ref.source}
                  onChange={(e) => handleReferenceChange(idx, "source", e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 text-xs rounded px-2.5 py-1.5 focus:border-slate-500 font-sans"
                />
              </div>
              {references.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveReference(idx)}
                  className="text-slate-400 hover:text-rose-700 p-1.5 cursor-pointer"
                  title="Remove reference"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </form>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="academic-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded bg-white p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="accent">PREVIEW MODE</Badge>
                <span className="text-xs text-slate-600 font-mono">
                  {selectedCategoryObj.name} • {publicationType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs font-mono text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer border border-slate-200"
              >
                Close Preview
              </button>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {title || "Untitled Manuscript"}
              </h1>

              <div className="bg-slate-50 border-l-4 border-rose-700 p-4 rounded-r italic text-slate-800 text-sm font-serif">
                <strong className="block text-[11px] font-sans font-bold uppercase tracking-wider text-rose-800 not-italic mb-1">
                  Abstract
                </strong>
                {abstract || "No abstract provided."}
              </div>

              <div className="bg-white p-6 rounded border border-slate-200 leading-relaxed max-h-[50vh] overflow-y-auto">
                <MathRenderer content={content || "No manuscript content entered yet."} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

