import { Publication, Category, ExternalPublicationRecord, ExternalAuthor } from "@/types";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { logServerWarn } from "@/lib/server-logger";

const OPENALEX_POLITE_EMAIL = "contact@quazion.org";
const OPENALEX_BASE_URL = "https://api.openalex.org";

/**
 * Curated Unsplash covers across all Quazion disciplines
 */
const DISCIPLINE_COVERS: Record<string, string[]> = {
  astrophysics: [
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  ],
  cosmology: [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
  ],
  "theoretical-physics": [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80",
  ],
  "quantum-mechanics": [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
  ],
  mathematics: [
    "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80",
  ],
  "space-science": [
    "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&auto=format&fit=crop&q=80",
  ],
  "life-sciences": [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&auto=format&fit=crop&q=80",
  ],
  "medicine-health": [
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1200&auto=format&fit=crop&q=80",
  ],
  "computer-science-ai": [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=80",
  ],
  chemistry: [
    "https://images.unsplash.com/photo-1603555501671-8f96b3fce8a6?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80",
  ],
};

export function getDisciplineCover(catSlug: string, seed: string): string {
  const list = DISCIPLINE_COVERS[catSlug] || DISCIPLINE_COVERS["astrophysics"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

/**
 * Reconstructs a full human-readable abstract from OpenAlex's inverted index format
 */
export function reconstructAbstract(
  invertedIndex?: Record<string, number[]> | null
): string {
  if (!invertedIndex || Object.keys(invertedIndex).length === 0) {
    return "Abstract is available through the primary publication source. Follow the DOI link for complete text and supplementary materials.";
  }

  try {
    let maxIndex = 0;
    for (const positions of Object.values(invertedIndex)) {
      for (const pos of positions) {
        if (pos > maxIndex) maxIndex = pos;
      }
    }

    // Safety guard against malicious/corrupted payload size
    if (maxIndex > 10000) maxIndex = 10000;

    const words: string[] = new Array(maxIndex + 1).fill("");
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        if (pos <= maxIndex) {
          words[pos] = word;
        }
      }
    }

    return words
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/\s([.,!?;:])/g, "$1")
      .trim();
  } catch (err) {
    logServerWarn("openalex:reconstructAbstract", "Failed to decode inverted index", {
      error: err instanceof Error ? err.message : String(err),
    });
    return "Abstract preview unavailable. View full manuscript via Open Access link.";
  }
}

/**
 * Maps OpenAlex topics and concepts to Quazion categories
 */
export function resolveOpenAlexCategory(work: OpenAlexWork): Category {
  const textToScan = [
    work.primary_topic?.display_name || "",
    work.primary_topic?.subfield?.display_name || "",
    work.primary_topic?.field?.display_name || "",
    ...(work.concepts || []).map((c) => c.display_name),
  ]
    .join(" ")
    .toLowerCase();

  if (textToScan.includes("astro") || textToScan.includes("stellar") || textToScan.includes("galaxy")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "astrophysics") || MOCK_CATEGORIES[0];
  }
  if (textToScan.includes("cosmol") || textToScan.includes("relativity") || textToScan.includes("gravit")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "cosmology") || MOCK_CATEGORIES[1];
  }
  if (textToScan.includes("quantum") || textToScan.includes("qubit") || textToScan.includes("entangle")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "quantum-mechanics") || MOCK_CATEGORIES[5];
  }
  if (textToScan.includes("particle physics") || textToScan.includes("theoretical physics") || textToScan.includes("field theory")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "theoretical-physics") || MOCK_CATEGORIES[2];
  }
  if (textToScan.includes("space") || textToScan.includes("orbit") || textToScan.includes("planetary") || textToScan.includes("satellite")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "space-science") || MOCK_CATEGORIES[3];
  }
  if (textToScan.includes("math") || textToScan.includes("algebra") || textToScan.includes("topology") || textToScan.includes("geometry")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "mathematics") || MOCK_CATEGORIES[4];
  }
  if (
    textToScan.includes("biolog") ||
    textToScan.includes("genom") ||
    textToScan.includes("genetic") ||
    textToScan.includes("crispr") ||
    textToScan.includes("cell")
  ) {
    return MOCK_CATEGORIES.find((c) => c.slug === "life-sciences") || MOCK_CATEGORIES[0];
  }
  if (
    textToScan.includes("medicin") ||
    textToScan.includes("neuro") ||
    textToScan.includes("clinical") ||
    textToScan.includes("immun") ||
    textToScan.includes("health")
  ) {
    return MOCK_CATEGORIES.find((c) => c.slug === "medicine-health") || MOCK_CATEGORIES[0];
  }
  if (
    textToScan.includes("computer science") ||
    textToScan.includes("artificial intelligence") ||
    textToScan.includes("machine learning") ||
    textToScan.includes("neural") ||
    textToScan.includes("software")
  ) {
    return MOCK_CATEGORIES.find((c) => c.slug === "computer-science-ai") || MOCK_CATEGORIES[0];
  }
  if (
    textToScan.includes("chemist") ||
    textToScan.includes("nanotech") ||
    textToScan.includes("material science") ||
    textToScan.includes("catalys")
  ) {
    return MOCK_CATEGORIES.find((c) => c.slug === "chemistry") || MOCK_CATEGORIES[0];
  }

  // Default fallback
  return MOCK_CATEGORIES[0];
}

/**
 * Computes an industry-standard trending/velocity score
 */
export function calculateTrendingScore(citations: number, publishedAt: string, isOpenAccess: boolean): number {
  const publishedDate = new Date(publishedAt).getTime();
  const now = Date.now();
  const ageInDays = Math.max(0.1, (now - publishedDate) / (1000 * 60 * 60 * 24));

  const oaBonus = isOpenAccess ? 10 : 0;
  // Trending Score formula with citation acceleration and recency decay
  const score = (citations * 1.8 + oaBonus + 5) / Math.pow(ageInDays + 2, 1.2);
  return Math.round(score * 100) / 100;
}

export interface OpenAlexWork {
  id: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_date?: string | null;
  type?: string | null;
  cited_by_count?: number | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  primary_location?: {
    is_oa?: boolean | null;
    landing_page_url?: string | null;
    pdf_url?: string | null;
    license?: string | null;
    source?: {
      display_name?: string | null;
      type?: string | null;
    } | null;
  } | null;
  open_access?: {
    is_oa?: boolean | null;
    oa_status?: string | null;
    oa_url?: string | null;
  } | null;
  authorships?: Array<{
    author?: {
      id?: string | null;
      display_name?: string | null;
      orcid?: string | null;
    } | null;
    institutions?: Array<{
      display_name?: string | null;
    }> | null;
  }> | null;
  primary_topic?: {
    display_name?: string | null;
    subfield?: { display_name?: string | null } | null;
    field?: { display_name?: string | null } | null;
  } | null;
  concepts?: Array<{
    display_name?: string | null;
    score?: number | null;
  }> | null;
}

/**
 * Normalizes an OpenAlex API work object into an ExternalPublicationRecord
 */
export function normalizeOpenAlexWork(work: OpenAlexWork): ExternalPublicationRecord | null {
  const title = work.title || work.display_name;
  if (!title) return null;

  const rawId = work.id.replace("https://openalex.org/", "");
  const category = resolveOpenAlexCategory(work);
  const abstract = reconstructAbstract(work.abstract_inverted_index);

  const cleanDoi = work.doi
    ? work.doi.replace(/^https?:\/\/doi\.org\//i, "").toLowerCase()
    : null;

  const publishedAt = work.publication_date
    ? new Date(work.publication_date).toISOString()
    : new Date().toISOString();

  const isOA = Boolean(work.open_access?.is_oa || work.primary_location?.is_oa);
  const pdfUrl = work.primary_location?.pdf_url || work.open_access?.oa_url || null;
  const sourceUrl = work.primary_location?.landing_page_url || work.doi || `https://openalex.org/${rawId}`;
  const citationCount = work.cited_by_count || 0;
  const trendingScore = calculateTrendingScore(citationCount, publishedAt, isOA);

  const authors: ExternalAuthor[] = (work.authorships || []).slice(0, 10).map((a) => ({
    name: a.author?.display_name || "Contributing Researcher",
    orcid: a.author?.orcid ? a.author.orcid.replace(/^https?:\/\/orcid\.org\//i, "") : undefined,
    affiliation: a.institutions && a.institutions.length > 0 ? a.institutions[0].display_name || undefined : undefined,
  }));

  if (authors.length === 0) {
    authors.push({ name: "Scientific Research Collective" });
  }

  const slug = `openalex-${rawId.toLowerCase()}`;

  return {
    id: `ext-${rawId.toLowerCase()}`,
    source: "openalex",
    external_id: rawId,
    doi: cleanDoi,
    title,
    slug,
    abstract,
    category_slug: category.slug,
    authors,
    publication_type: "Research Paper",
    published_at: publishedAt,
    cover_image: getDisciplineCover(category.slug, rawId),
    document_url: pdfUrl,
    source_url: sourceUrl,
    citation_count: citationCount,
    trending_score: trendingScore,
    is_open_access: isOA,
    license: work.primary_location?.license || (isOA ? "open-access" : null),
    raw_metadata: {
      primary_topic: work.primary_topic?.display_name,
      concepts: (work.concepts || []).slice(0, 5).map((c) => c.display_name),
    },
    created_at: publishedAt,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Converts an ExternalPublicationRecord into the UI Publication entity
 */
export function externalRecordToPublication(record: ExternalPublicationRecord): Publication {
  const categoryMatch = MOCK_CATEGORIES.find((c) => c.slug === record.category_slug) || MOCK_CATEGORIES[0];
  const primaryAuthor = record.authors[0] || { name: "Open Science Researcher" };

  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    abstract: record.abstract,
    content: record.abstract,
    publicationType: "Research Paper",
    category: categoryMatch,
    tags: [categoryMatch.name, record.source.toUpperCase(), ...(record.authors.slice(0, 2).map((a) => a.name))],
    keywords: [record.category_slug, record.source],
    author: {
      id: `author-${record.external_id}`,
      username: primaryAuthor.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30),
      displayName: primaryAuthor.name,
      bio: primaryAuthor.affiliation,
      affiliation: primaryAuthor.affiliation,
      orcid: primaryAuthor.orcid,
      role: "CREATOR",
      createdAt: record.published_at,
      totalPublications: 1,
    },
    status: "PUBLISHED",
    coverImage: record.cover_image || getDisciplineCover(record.category_slug, record.external_id),
    documentUrl: record.document_url || undefined,
    views: Math.max(record.citation_count * 12, 140),
    likes: Math.max(Math.floor(record.citation_count * 1.5), 12),
    downloads: Math.max(Math.floor(record.citation_count * 2.8), 24),
    readingTimeMinutes: Math.max(4, Math.min(15, Math.ceil(record.abstract.length / 500))),
    createdAt: record.published_at,
    publishedAt: record.published_at,
    sourceName: record.source === "openalex" ? "OpenAlex Verified" : record.source.toUpperCase(),
    sourceUrl: record.source_url,
    isExternal: true,
    externalId: record.external_id,
    doi: record.doi || undefined,
    citationCount: record.citation_count,
    isOpenAccess: record.is_open_access,
    trendingScore: record.trending_score,
  };
}

/**
 * Fetches recent high-impact works from OpenAlex API across scientific disciplines
 */
export async function fetchOpenAlexPublications(options: {
  categorySlug?: string;
  limit?: number;
  openAccessOnly?: boolean;
} = {}): Promise<ExternalPublicationRecord[]> {
  const { categorySlug, limit = 25, openAccessOnly = false } = options;

  // Compute 60 days lookback window
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - 60);
  const dateStr = lookbackDate.toISOString().split("T")[0];

  const filters = [
    `from_publication_date:${dateStr}`,
    "has_abstract:true",
    "has_doi:true",
  ];

  if (openAccessOnly) {
    filters.push("is_oa:true");
  }

  // Filter by category keywords if specified
  if (categorySlug && categorySlug !== "all") {
    if (categorySlug === "life-sciences") {
      filters.push("default.search:biology OR genetics OR crispr");
    } else if (categorySlug === "medicine-health") {
      filters.push("default.search:medicine OR clinical OR neuroscience");
    } else if (categorySlug === "computer-science-ai") {
      filters.push("default.search:artificial intelligence OR machine learning");
    } else if (categorySlug === "chemistry") {
      filters.push("default.search:chemistry OR materials science");
    } else if (categorySlug === "astrophysics") {
      filters.push("default.search:astrophysics OR astronomy");
    } else if (categorySlug === "cosmology") {
      filters.push("default.search:cosmology OR gravitational");
    } else if (categorySlug === "theoretical-physics") {
      filters.push("default.search:theoretical physics OR quantum gravity");
    } else if (categorySlug === "quantum-mechanics") {
      filters.push("default.search:quantum mechanics OR quantum computing");
    } else if (categorySlug === "mathematics") {
      filters.push("default.search:mathematics OR geometry");
    }
  }

  const params = new URLSearchParams({
    filter: filters.join(","),
    sort: "cited_by_count:desc,publication_date:desc",
    per_page: String(Math.min(limit, 50)),
    mailto: OPENALEX_POLITE_EMAIL,
  });

  const url = `${OPENALEX_BASE_URL}/works?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8-second circuit breaker

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": `QUAZION-OpenSciencePlatform/1.0 (mailto:${OPENALEX_POLITE_EMAIL}; https://quazion.org)`,
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      logServerWarn("openalex:fetchOpenAlexPublications", `OpenAlex API responded with HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const works: OpenAlexWork[] = data.results || [];

    const records: ExternalPublicationRecord[] = [];
    for (const work of works) {
      const normalized = normalizeOpenAlexWork(work);
      if (normalized) {
        records.push(normalized);
      }
    }

    return records;
  } catch (err) {
    logServerWarn("openalex:fetchOpenAlexPublications", "OpenAlex request failed or timed out", {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
