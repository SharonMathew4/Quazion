/**
 * Client-Side Zero-Console Error Telemetry Dispatcher
 *
 * Captures client-side errors and dispatches them silently in the background
 * to the server telemetry endpoint (/api/telemetry/errors).
 *
 * CRITICAL SECURITY & UX REQUIREMENT:
 * Absolutely NEVER logs to window.console.error or window.console.warn.
 * Keeps user DevTools completely clean while capturing rich diagnostic data on the server.
 */

interface ClientErrorTelemetry {
  context: string;
  message: string;
  name?: string;
  stack?: string;
  route?: string;
  timestamp: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatches an error occurring on the client to the server telemetry logger.
 * Silent and non-blocking.
 */
export function reportClientError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") {
    // If somehow invoked in an SSR context, ignore (server code should use server-logger)
    return;
  }

  try {
    let message = "Unknown client-side exception";
    let name: string | undefined;
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      name = error.name;
      stack = error.stack;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      try {
        message = JSON.stringify(error);
      } catch {
        message = String(error);
      }
    }

    const payload: ClientErrorTelemetry = {
      context,
      message,
      name,
      stack,
      route: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metadata,
    };

    const endpoint = "/api/telemetry/errors";
    const body = JSON.stringify(payload);

    // Prefer navigator.sendBeacon for fire-and-forget telemetry (unloading resilience)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Suppress any transmission failures to prevent client console pollution
    });
  } catch {
    // Completely silent fallback to protect user console
  }
}

