import { NextRequest, NextResponse } from "next/server";
import { getExternalPublications } from "@/lib/external-publications";
import { logServerError } from "@/lib/server-logger";

export const dynamic = "force-dynamic";

/**
 * Public Feed API Endpoint
 * Serves syndicated high-impact research papers from OpenAlex & arXiv.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const sourceParam = searchParams.get("source");
    const source = (sourceParam === "openalex" || sourceParam === "arxiv") ? sourceParam : "all";
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const publications = await getExternalPublications({
      categorySlug: category,
      source,
      limit: Math.min(limit, 50),
    });

    return NextResponse.json({ publications });
  } catch (err: unknown) {
    logServerError("API_feed_route", err);
    return NextResponse.json(
      { error: "Unable to retrieve syndicated research feed at this time.", publications: [] },
      { status: 500 }
    );
  }
}
