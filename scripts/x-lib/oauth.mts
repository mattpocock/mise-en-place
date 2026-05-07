import { randomBytes, createHash } from "node:crypto";
import { loadTokens, saveTokens, type Tokens } from "./storage.mts";

const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const AUTH_URL = "https://x.com/i/oauth2/authorize";
export const REDIRECT_PORT = 47891;
export const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
export const SCOPES = ["tweet.read", "users.read", "offline.access"];

const base64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const generateCodeVerifier = () => base64url(randomBytes(32));
export const generateCodeChallenge = (verifier: string) =>
  base64url(createHash("sha256").update(verifier).digest());

export function buildAuthUrl(opts: {
  clientId: string;
  state: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

function basicAuth(clientId: string, clientSecret: string): string {
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export async function exchangeCode(opts: {
  clientId: string;
  clientSecret: string;
  code: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: REDIRECT_URI,
    code_verifier: opts.codeVerifier,
    client_id: opts.clientId,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuth(opts.clientId, opts.clientSecret),
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshTokens(opts: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: opts.refreshToken,
    client_id: opts.clientId,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuth(opts.clientId, opts.clientSecret),
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function getValidAccessToken(): Promise<Tokens> {
  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error("No tokens found. Run `npm run x:auth` first.");
  }
  const skewMs = 60_000;
  if (Date.now() < tokens.expires_at - skewMs) return tokens;

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X_CLIENT_ID and X_CLIENT_SECRET must be set in .env");
  }
  const refreshed = await refreshTokens({
    clientId,
    clientSecret,
    refreshToken: tokens.refresh_token,
  });
  const updated: Tokens = {
    ...tokens,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: Date.now() + refreshed.expires_in * 1000,
  };
  await saveTokens(updated);
  return updated;
}
