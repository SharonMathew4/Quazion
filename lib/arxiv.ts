import { Publication, Category, Profile } from "@/types";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

/**
 * High-quality curated Unsplash covers for scientific disciplines
 */
const CATEGORY_COVERS: Record<string, string[]> = {
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
};

function getCoverForCategory(catSlug: string, seed: string): string {
  const list = CATEGORY_COVERS[catSlug] || CATEGORY_COVERS["astrophysics"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

/**
 * Decode basic XML / HTML entities
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Map arXiv category codes to Quazion Category entities
 */
function resolveArxivCategory(catCode: string): Category {
  const normalized = catCode.toLowerCase();

  if (normalized.startsWith("astro-ph")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "astrophysics") || MOCK_CATEGORIES[0];
  }
  if (normalized.startsWith("gr-qc")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "cosmology") || MOCK_CATEGORIES[1];
  }
  if (normalized.startsWith("hep-") || normalized.startsWith("physics.gen-ph")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "theoretical-physics") || MOCK_CATEGORIES[2];
  }
  if (normalized.startsWith("quant-ph")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "quantum-mechanics") || MOCK_CATEGORIES[5];
  }
  if (normalized.startsWith("math")) {
    return MOCK_CATEGORIES.find((c) => c.slug === "mathematics") || MOCK_CATEGORIES[4];
  }

  // Fallback to astrophysics
  return MOCK_CATEGORIES[0];
}

/**
 * Extract clean arXiv ID from an entry ID URL (e.g. "http://arxiv.org/abs/2403.12345v1")
 */
function extractArxivId(rawId: string): string {
  const match = rawId.match(/abs\/([^/]+?)(?:v\d+)?$/);
  if (match) return match[1];
  const parts = rawId.split("/");
  return parts[parts.length - 1].replace(/v\d+$/, "");
}

/**
 * Parse an individual <entry> block from arXiv Atom XML
 */
function parseArxivEntry(entryXml: string): Publication | null {
  try {
    // Extract ID
    const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/);
    if (!idMatch) return null;
    const rawId = decodeXmlEntities(idMatch[1]);
    const arxivId = extractArxivId(rawId);

    // Extract Title
    const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/);
    const title = titleMatch ? decodeXmlEntities(titleMatch[1]) : `arXiv Paper ${arxivId}`;

    // Extract Summary / Abstract
    const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/);
    const abstract = summaryMatch ? decodeXmlEntities(summaryMatch[1]) : "No abstract provided.";

    // Extract Published Date
    const publishedMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/);
    const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

    // Extract Authors
    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
    let authMatch;
    while ((authMatch = authorRegex.exec(entryXml)) !== null) {
      authors.push(decodeXmlEntities(authMatch[1]));
    }
    const leadAuthorName = authors[0] || "arXiv Researcher";
    const authorUsername = leadAuthorName.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 24);

    // Extract Primary Category
    const categoryMatch = entryXml.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
    const catCode = categoryMatch ? categoryMatch[1] : "astro-ph";
    const category = resolveArxivCategory(catCode);

    // Extract PDF link
    const pdfMatch = entryXml.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
    const pdfUrl = pdfMatch
      ? pdfMatch[1].replace("http://", "https://")
      : `https://arxiv.org/pdf/${arxivId}.pdf`;

    // Extract DOI if present
    const doiMatch = entryXml.match(/<arxiv:doi>([\s\S]*?)<\/arxiv:doi>/);
    const doi = doiMatch ? decodeXmlEntities(doiMatch[1]) : undefined;

    // Estimate Reading Time (words / 200)
    const wordCount = abstract.split(/\s+/).length + 1500; // Average paper body estimate
    const readingTime = Math.max(4, Math.ceil(wordCount / 200));

    // Construct Author Profile
    const author: Profile = {
      id: `arxiv-author-${authorUsername}`,
      username: authorUsername,
      displayName: leadAuthorName,
      avatarUrl: undefined,
      bio: authors.length > 1 ? `With co-authors: ${authors.slice(1, 4).join(", ")}${authors.length > 4 ? " et al." : ""}` : "Primary arXiv Investigator",
      affiliation: "arXiv.org Open Science Contributor",
      role: "CREATOR",
      createdAt: publishedAt,
      totalPublications: 1,
    };

    const slug = `arxiv-${arxivId}`;

    return {
      id: `arxiv-${arxivId}`,
      title,
      slug,
      abstract,
      content: abstract, // Full manuscript downloadable via PDF
      publicationType: "Research Paper",
      category,
      tags: [category.name, "arXiv Preprint", catCode],
      keywords: [catCode, ...authors.slice(0, 3)],
      author,
      status: "PUBLISHED",
      coverImage: getCoverForCategory(category.slug, arxivId),
      documentUrl: pdfUrl,
      views: 350 + Math.floor(Math.random() * 500),
      likes: 18 + Math.floor(Math.random() * 45),
      downloads: 42 + Math.floor(Math.random() * 80),
      readingTimeMinutes: readingTime,
      createdAt: publishedAt,
      publishedAt,
      sourceName: "arXiv.org",
      sourceUrl: `https://arxiv.org/abs/${arxivId}`,
      isExternal: true,
      externalId: arxivId,
      doi,
    };
  } catch (err) {
    console.error("[SERVER_ARXIV] Error parsing arXiv entry:", err);
    return null;
  }
}

/**
 * Fetch a list of recent scientific publications from arXiv across key disciplines
 */
export async function fetchArxivPublications(options: {
  category?: string;
  limit?: number;
} = {}): Promise<Publication[]> {
  const { category, limit = 20 } = options;

  // Construct arXiv search query
  let searchQuery = "cat:astro-ph* OR cat:gr-qc OR cat:hep-th OR cat:quant-ph OR cat:math.CO";
  if (category) {
    if (category === "astrophysics") searchQuery = "cat:astro-ph*";
    else if (category === "cosmology") searchQuery = "cat:gr-qc";
    else if (category === "theoretical-physics") searchQuery = "cat:hep-th OR cat:hep-ph";
    else if (category === "quantum-mechanics") searchQuery = "cat:quant-ph";
    else if (category === "mathematics") searchQuery = "cat:math*";
  }

  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(
    searchQuery
  )}&sortBy=submittedDate&sortOrder=descending&max_results=${Math.min(limit, 50)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8-second circuit breaker

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache on Next.js server for 1 hour
      headers: {
        "User-Agent": "QUAZION-OpenSciencePlatform/1.0 (https://quazion.org; scientific-feed)",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[SERVER_ARXIV] arXiv API responded with HTTP ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    const entryBlocks = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const publications: Publication[] = [];
    for (const entryXml of entryBlocks) {
      const pub = parseArxivEntry(entryXml);
      if (pub) publications.push(pub);
    }

    return publications;
  } catch (err) {
    console.warn("[SERVER_ARXIV] Notice: arXiv query timed out or unreachable:", err);
    return [];
  }
}

/**
 * Fetch a single arXiv publication by its identifier (e.g. "2403.12345" or "hep-th/9901001")
 */
export async function fetchArxivPublicationById(arxivId: string): Promise<Publication | null> {
  const cleanId = arxivId.replace(/^arxiv-/i, "").replace(/v\d+$/, "");
  const url = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "QUAZION-OpenSciencePlatform/1.0 (https://quazion.org; scientific-feed)",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const xmlText = await res.text();
    const entryMatch = xmlText.match(/<entry>[\s\S]*?<\/entry>/);
    if (!entryMatch) return null;

    return parseArxivEntry(entryMatch[0]);
  } catch (err) {
    console.warn(`[SERVER_ARXIV] Notice: arXiv paper fetch failed for ${cleanId}:`, err);
    return null;
  }
}
