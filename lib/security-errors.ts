/**
 * Security & Error Sanitization Utility
 *
 * Ensures that no internal backend details, database schemas, SQL constraint names,
 * stack traces, or raw error messages are leaked to the client browser or console.
 */

const KNOWN_AUTH_ERROR_MAP: Record<string, string> = {
  auth_failed: "Authentication could not be completed. Please try again.",
  session_expired: "Your session has expired. Please sign in again.",
  orcid_not_configured: "ORCID API service is currently unavailable. Please try an alternative sign-in method.",
  orcid_cancelled: "ORCID authorization was cancelled.",
  invalid_oauth_state: "Security validation failed. Please try signing in again.",
  csrf_validation_failed: "Security token verification failed. Please try signing in again.",
  orcid_already_linked: "This ORCID identity is already linked to another researcher profile.",
  email_already_registered: "An account with this institutional email already exists. Please sign in.",
  access_denied: "Access was denied by the identity provider.",
  link_failed: "Unable to link researcher identity. Please verify credentials and try again.",
};

/**
 * Validates and safely formats URL query 'error' parameters.
 * Whitelists known error codes and prevents reflected raw strings, XSS, or leaked internal messages.
 */
export function formatAuthErrorParam(errorCode: string | null): string | null {
  if (!errorCode) return null;

  const normalized = errorCode.trim().toLowerCase();
  if (KNOWN_AUTH_ERROR_MAP[normalized]) {
    return KNOWN_AUTH_ERROR_MAP[normalized];
  }

  // If error code is unknown, return a generic safe message without reflecting input
  return "Authentication could not be completed. Please try again.";
}

/**
 * Sanitizes unknown client-side exceptions into friendly, non-leaking error messages.
 * Prevents PostgreSQL constraints, table names, and stack traces from reaching UI or logs.
 */
export function getSanitizedErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  const rawMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = rawMessage.toLowerCase();

  // Network / Connectivity / Fetch issues
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("econnrefused") ||
    lower.includes("timeout") ||
    lower.includes("abort") ||
    lower.includes("offline")
  ) {
    return "Network connection issue detected. Please verify your internet connection and try again.";
  }

  // Unique constraint / duplicate entry (PostgreSQL error 23505)
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("23505")) {
    return "A manuscript or record with this title or identifier already exists. Please provide a distinct title.";
  }

  // Foreign key / relation constraint (PostgreSQL error 23503)
  if (lower.includes("foreign key") || lower.includes("23503")) {
    return "Referenced category or author record could not be found. Please refresh and try again.";
  }

  // Row Level Security / Permission denied (PostgreSQL error 42501)
  if (
    lower.includes("permission denied") ||
    lower.includes("row-level security") ||
    lower.includes("42501") ||
    lower.includes("unauthorized") ||
    lower.includes("not allowed")
  ) {
    return "You do not have the required permissions to perform this action.";
  }

  // Not null violation
  if (lower.includes("not-null") || lower.includes("null value")) {
    return "Please complete all required fields before proceeding.";
  }

  // File size / storage issues
  if (lower.includes("exceed") || lower.includes("size") || lower.includes("too large") || lower.includes("413")) {
    return "The uploaded file exceeds the permissible file size limit (50MB maximum).";
  }

  // JWT / Auth expired
  if (lower.includes("jwt") || lower.includes("token") || lower.includes("expired") || lower.includes("session")) {
    return "Your session has expired or is invalid. Please sign in again to continue.";
  }

  // PostgREST 404 / PGRST116 (0 rows returned)
  if (lower.includes("pgrst116") || lower.includes("not found")) {
    return "The requested scientific record or manuscript could not be found.";
  }

  // Default to secure fallback
  return fallbackMessage;
}
