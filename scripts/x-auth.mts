#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  buildAuthUrl,
  exchangeCode,
  generateCodeChallenge,
  generateCodeVerifier,
  REDIRECT_PORT,
  REDIRECT_URI,
} from "./lib/oauth.mts";
import { getMe } from "./lib/x-api.mts";
import { saveTokens } from "./lib/storage.mts";

const clientId = process.env.X_CLIENT_ID;
const clientSecret = process.env.X_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Missing X_CLIENT_ID or X_CLIENT_SECRET in .env");
  process.exit(1);
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
const state = randomBytes(16).toString("hex");

const authUrl = buildAuthUrl({ clientId, state, codeChallenge });

const app = new Hono();

const codePromise = new Promise<string>((resolve, reject) => {
  app.get("/callback", (c) => {
    const returnedState = c.req.query("state");
    const code = c.req.query("code");
    const error = c.req.query("error");
    if (error) {
      reject(new Error(`OAuth error: ${error}`));
      return c.text(`OAuth error: ${error}`, 400);
    }
    if (returnedState !== state) {
      reject(new Error("State mismatch"));
      return c.text("State mismatch", 400);
    }
    if (!code) {
      reject(new Error("No code in callback"));
      return c.text("Missing code", 400);
    }
    resolve(code);
    return c.text("Authorized. You can close this tab.");
  });
});

const server = serve({ fetch: app.fetch, port: REDIRECT_PORT });

console.log("Open this URL in your browser to authorize:\n");
console.log(authUrl);
console.log(`\nWaiting for callback on ${REDIRECT_URI} ...`);

try {
  const code = await codePromise;
  const tokens = await exchangeCode({
    clientId,
    clientSecret,
    code,
    codeVerifier,
  });
  const me = await getMe(tokens.access_token);
  await saveTokens({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    user_id: me.data.id,
    username: me.data.username,
  });
  console.log(`\nAuthorized as @${me.data.username} (id: ${me.data.id}).`);
  console.log("Tokens saved to data/x-tokens.json.");
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  server.close();
}
