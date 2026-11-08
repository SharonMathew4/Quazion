import { NextRequest, NextResponse } from "next/server";
import { logServerError } from "@/lib/server-logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { context, message, stack, route, timestamp, userAgent, metadata } = body || {};

    // Validate that this is reasonable telemetry data
    if (!context || !message) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Log the error strictly on the server
    logServerError(`[CLIENT_TELEMETRY] ${context}`, new Error(message), {
      clientStack: stack,
      route,
      clientTimestamp: timestamp,
      userAgent,
      ...metadata,
    });

    return NextResponse.json({ success: true });
  } catch {
    // Return standard generic response without leaking internal errors
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

