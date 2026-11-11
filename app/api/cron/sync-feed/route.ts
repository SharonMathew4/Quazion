import { NextRequest, NextResponse } from "next/server";
import { fetchOpenAlexPublications } from "@/lib/openalex";
import { fetchArxivPublications } from "@/lib/arxiv";
import {
  upsertExternalPublications,
} from "@/lib/external-publications";
import { ExternalPublicationRecord } from "@/types";
import { logServerError, logServerInfo, logServerWarn } from "@/lib/server-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds execution budget for cron

/**
 * Scheduled Cron Ingestion Handler
 * Fetches high-impact scientific publications from OpenAlex (with arXiv fallback)
 * and syncs them into the Supabase external_publications database cache.
 */
export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const { searchParams } = new URL(req.url);
  const tokenParam = searchParams.get("token");

  // In production, require CRON_SECRET authorization
  if (process.env.NODE_ENV === "production" && cronSecret) {
    const bearerExpected = `Bearer ${cronSecret}`;
    if (authHeader !== bearerExpected && tokenParam !== cronSecret) {
      logServerWarn("cron:sync-feed", "Unauthorized sync attempt rejected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  logServerInfo("cron:sync-feed", "Starting scientific feed synchronization");

  const disciplines = [
    "all",
    "life-sciences",
    "medicine-health",
    "computer-science-ai",
    "chemistry",
    "astrophysics",
    "quantum-mechanics",
  ];

  const allRecords: ExternalPublicationRecord[] = [];
  const seenIds = new Set<string>();

  try {
    // 1. Ingest across diverse scientific disciplines from OpenAlex
    for (const discipline of disciplines) {
      try {
        const records = await fetchOpenAlexPublications({
          categorySlug: discipline === "all" ? undefined : discipline,
          limit: 15,
          openAccessOnly: false,
        });

        for (const r of records) {
          if (!seenIds.has(r.external_id)) {
            seenIds.add(r.external_id);
            allRecords.push(r);
          }
        }
      } catch (catErr) {
        logServerWarn("cron:sync-feed", `Failed fetching discipline: ${discipline}`, {
          error: catErr instanceof Error ? catErr.message : String(catErr),
        });
      }
    }

    // 2. arXiv fallback / complement for day-0 physics & math preprints
    try {
      const arxivPubs = await fetchArxivPublications({ limit: 20 });
      for (const p of arxivPubs) {
        if (!p.externalId || seenIds.has(p.externalId)) continue;
        seenIds.add(p.externalId);

        allRecords.push({
          id: `ext-arxiv-${p.externalId.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          source: "arxiv",
          external_id: p.externalId,
          doi: p.doi || null,
          title: p.title,
          slug: p.slug,
          abstract: p.abstract,
          category_slug: p.category.slug,
          authors: [
            {
              name: p.author.displayName || "arXiv Researcher",
              affiliation: p.author.affiliation,
              orcid: p.author.orcid,
            },
          ],
          publication_type: "Research Paper",
          published_at: p.publishedAt || p.createdAt,
          cover_image: p.coverImage || null,
          document_url: p.documentUrl || null,
          source_url: p.sourceUrl || `https://arxiv.org/abs/${p.externalId}`,
          citation_count: 0,
          trending_score: 15.0,
          is_open_access: true,
          license: "arXiv Open Access",
          raw_metadata: {},
          created_at: p.createdAt,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (arxivErr) {
      logServerWarn("cron:sync-feed", "arXiv complementary sync skipped", {
        error: arxivErr instanceof Error ? arxivErr.message : String(arxivErr),
      });
    }

    logServerInfo("cron:sync-feed", `Total external papers collected: ${allRecords.length}`);

    // 3. Upsert records into Supabase cache table
    const result = await upsertExternalPublications(allRecords);

    return NextResponse.json({
      success: true,
      ingested: allRecords.length,
      persisted: result.count,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logServerError("cron:sync-feed:fatal", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Sync failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
