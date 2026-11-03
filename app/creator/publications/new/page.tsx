"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { PublicationType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Plus, 
  Trash2
} from "lucide-react";

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

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [publicationType, setPublicationType] = useState<PublicationType>("Research Paper");
  const [categoryId, setCategoryId] = useState(MOCK_CATEGORIES[0].id);
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [references, setReferences] = useState<Array<{ title: string; authors: string; year: string; source: string }>>([
    { title: "", authors: "", year: "", source: "" },
  ]);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Publication draft saved successfully.");
      router.push("/creator/dashboard");
    }, 600);
  };

  const handleSubmitForReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim() || !content.trim()) {
      alert("Please fill in the required fields: Title, Abstract, and Main Content.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Publication submitted for moderation and publishing.");
      router.push("/creator/dashboard");
    }, 600);
  };

  const selectedCategoryObj = MOCK_CATEGORIES.find((c) => c.id === categoryId) || MOCK_CATEGORIES[0];

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
            Author and submit open scientific publications, research notes, and educational essays.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5"
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
            className="flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmitForReview}
            disabled={isSubmitting}
            className="flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit</span>
          </Button>
        </div>
      </div>

      {/* Editor Form */}
      <form className="space-y-8">
        
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
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500"
            >
              {MOCK_CATEGORIES.map((cat) => (
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
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500"
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
                className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800"
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

              <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {content || "No manuscript content entered yet."}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
