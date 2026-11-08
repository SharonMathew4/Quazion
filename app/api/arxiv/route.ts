import { NextRequest, NextResponse } from "next/server";
import { fetchArxivPublications } from "@/lib/arxiv";
import { logServerError } from "@/lib/server-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const publications = await fetchArxivPublications({
      category,
      limit: Math.min(limit, 50),
    });

    return NextResponse.json({ publications });
  } catch (err: unknown) {
    logServerError("API_arxiv_route", err);
    return NextResponse.json(
      { error: "Unable to retrieve external publications at this time.", publications: [] },
      { status: 500 }
    );
  }
}
