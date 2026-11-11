import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ExternalPublicationRecord, Publication } from "@/types";
import {
  fetchOpenAlexPublications,
  externalRecordToPublication,
} from "@/lib/openalex";
import { fetchArxivPublications } from "@/lib/arxiv";
import { logServerError, logServerWarn } from "@/lib/server-logger";

/**
 * Retrieves syndicated research papers from the Supabase cache.
 * Falls back to live OpenAlex/arXiv fetch if cache is cold.
 */
export async function getExternalPublications(options: {
  categorySlug?: string;
  source?: "all" | "openalex" | "arxiv";
  limit?: number;
} = {}): Promise<Publication[]> {
  const { categorySlug, source = "all", limit = 20 } = options;

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("external_publications")
      .select("*")
      .order("trending_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(limit);

    if (categorySlug && categorySlug !== "all") {
      query = query.eq("category_slug", categorySlug);
    }

    if (source && source !== "all") {
      query = query.eq("source", source);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return (data as ExternalPublicationRecord[]).map(externalRecordToPublication);
    }
  } catch (err) {
    logServerWarn("getExternalPublications", "Supabase external_publications query failed, using direct provider fallback", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Graceful fallback to live multi-provider fetch if database cache is cold
  try {
    const openAlexRecords = await fetchOpenAlexPublications({
      categorySlug,
      limit: Math.ceil(limit * 0.7),
    });

    const openAlexPubs = openAlexRecords.map(externalRecordToPublication);

    // Complement with arXiv if needed
    let arxivPubs: Publication[] = [];
    if (source === "all" || source === "arxiv") {
      try {
        arxivPubs = await fetchArxivPublications({
          category: categorySlug,
          limit: Math.ceil(limit * 0.3),
        });
      } catch {
        arxivPubs = [];
      }
    }

    const merged = [...openAlexPubs, ...arxivPubs].slice(0, limit);
    return merged;
  } catch (fallbackErr) {
    logServerError("getExternalPublications:fallback", fallbackErr);
    return [];
  }
}

/**
 * Retrieves a single external paper by slug from the database cache or live API
 */
export async function getExternalPublicationBySlug(slug: string): Promise<Publication | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("external_publications")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return externalRecordToPublication(data as ExternalPublicationRecord);
    }
  } catch (err) {
    logServerWarn("getExternalPublicationBySlug", "Supabase query error", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // If slug starts with openalex-
  if (slug.startsWith("openalex-")) {
    const workId = slug.replace(/^openalex-/i, "").toUpperCase();
    try {
      const res = await fetch(`https://api.openalex.org/works/${workId}?mailto=contact@quazion.org`, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "QUAZION-OpenSciencePlatform/1.0 (mailto:contact@quazion.org; https://quazion.org)",
        },
      });
      if (res.ok) {
        const work = await res.json();
        const { normalizeOpenAlexWork } = await import("@/lib/openalex");
        const normalized = normalizeOpenAlexWork(work);
        if (normalized) {
          return externalRecordToPublication(normalized);
        }
      }
    } catch (err) {
      logServerWarn("getExternalPublicationBySlug:openalex", "Failed direct OpenAlex lookup", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return null;
}

/**
 * Upserts a batch of external publications into Supabase using the admin service role.
 */
export async function upsertExternalPublications(
  records: ExternalPublicationRecord[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (records.length === 0) {
    return { success: true, count: 0 };
  }

  const adminClient = createAdminSupabaseClient();
  if (!adminClient) {
    logServerWarn("upsertExternalPublications", "Supabase admin client unavailable; skipping cache persistence");
    return { success: false, count: 0, error: "Admin client not configured" };
  }

  try {
    const { error } = await adminClient
      .from("external_publications")
      .upsert(records, {
        onConflict: "source,external_id",
        ignoreDuplicates: false,
      });

    if (error) {
      logServerError("upsertExternalPublications:upsert", error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: records.length };
  } catch (err) {
    logServerError("upsertExternalPublications", err);
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
