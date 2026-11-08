/**
 * Server-Side Structured Diagnostic Logger
 *
 * Exclusively executes on the server runtime.
 * Safely writes diagnostic logs to process.stdout / process.stderr.
 * NEVER leaks or mirrors internal error traces to the client browser.
 */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  stack?: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes metadata to prevent secrets, tokens, or sensitive credentials
 * from appearing in server log streams.
 */
function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;

  const SENSITIVE_KEYS = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "cookie",
    "credential",
    "service_role",
  ];

  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    const isSensitive = SENSITIVE_KEYS.some((sk) => k.toLowerCase().includes(sk));
    if (isSensitive) {
      clean[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null) {
      try {
        clean[k] = JSON.parse(JSON.stringify(v));
      } catch {
        clean[k] = "[Unserializable Object]";
      }
    } else {
      clean[k] = v;
    }
  }

  return clean;
}

export function logServerError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  let message = "Unknown server exception";
  let stack: string | undefined;

  if (error instanceof Error) {
    message = error.message;
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

  const payload: LogPayload = {
    level: "error",
    context,
    message,
    timestamp,
    stack,
    metadata: sanitizeMetadata(metadata),
  };

  // Structured single-line JSON log for cloud loggers (Vercel, Datadog, CloudWatch)
  const formatted = `[SERVER_ERROR] [${timestamp}] [${context}] ${message}${
    payload.metadata ? ` | Meta: ${JSON.stringify(payload.metadata)}` : ""
  }${stack ? `\nStack: ${stack}` : ""}`;

  // Direct output to server stderr
  console.error(formatted);
}

export function logServerWarn(
  context: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const formatted = `[SERVER_WARN] [${timestamp}] [${context}] ${message}${
    metadata ? ` | Meta: ${JSON.stringify(sanitizeMetadata(metadata))}` : ""
  }`;
  console.warn(formatted);
}

export function logServerInfo(
  context: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const formatted = `[SERVER_INFO] [${timestamp}] [${context}] ${message}${
    metadata ? ` | Meta: ${JSON.stringify(sanitizeMetadata(metadata))}` : ""
  }`;
  console.log(formatted);
}

