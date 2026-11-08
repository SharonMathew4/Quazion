/**
 * Quazion ORCID OAuth 2.0 Integration Helper
 * 
 * Implements RFC 6749 Authorization Code Flow with ORCID's Public API (/authenticate scope).
 * Supports both Sandbox (testing) and Production environments.
 */

export interface OrcidConfig {
  clientId: string;
  clientSecret: string;
  isProduction: boolean;
  baseUrl: string;
  authorizeUrl: string;
  tokenUrl: string;
}

export interface OrcidTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  name: string;
  orcid: string;
  error?: string;
  error_description?: string;
}

/**
 * Resolves ORCID configuration based on environment variables.
 */
export function getOrcidConfig(): OrcidConfig {
  const clientId = process.env.NEXT_PUBLIC_ORCID_CLIENT_ID || "";
  const clientSecret = process.env.ORCID_CLIENT_SECRET || "";
  const isProduction = process.env.NEXT_PUBLIC_ORCID_ENV === "production";
  const baseUrl = isProduction ? "https://orcid.org" : "https://sandbox.orcid.org";

  return {
    clientId,
    clientSecret,
    isProduction,
    baseUrl,
    authorizeUrl: `${baseUrl}/oauth/authorize`,
    tokenUrl: `${baseUrl}/oauth/token`,
  };
}

/**
 * Builds the 3-legged OAuth authorization URL to redirect researchers to ORCID.
 */
export function getOrcidAuthorizeUrl(params: {
  state: string;
  redirectUri: string;
}): string {
  const config = getOrcidConfig();
  const searchParams = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    scope: "/authenticate",
    redirect_uri: params.redirectUri,
    state: params.state,
  });

  return `${config.authorizeUrl}?${searchParams.toString()}`;
}

/**
 * Exchanges the temporary authorization code for an authenticated ORCID iD and token.
 */
export async function exchangeOrcidCodeForToken(params: {
  code: string;
  redirectUri: string;
}): Promise<OrcidTokenResponse> {
  const config = getOrcidConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      "ORCID credentials are not configured. Please set NEXT_PUBLIC_ORCID_CLIENT_ID and ORCID_CLIENT_SECRET."
    );
  }

  const bodyParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: bodyParams.toString(),
  });

  const data = (await response.json()) as OrcidTokenResponse;

  if (!response.ok || data.error) {
    const errorMsg = data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`ORCID token exchange failed: ${errorMsg}`);
  }

  return data;
}

/**
 * Validates the structure and ISO 7064 Mod 11-2 checksum of an ORCID identifier.
 * Format: 0000-0002-1825-0097 or ending with 'X'
 */
export function isValidOrcid(orcid: string): boolean {
  const regex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
  return regex.test(orcid);
}
