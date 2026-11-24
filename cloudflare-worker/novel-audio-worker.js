const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const TTL_SECONDS = 600;
const MAX_UPLOAD_BYTES = 120 * 1024 * 1024;

let jwksCache = { keys: null, fetchedAt: 0 };

function json(data, status, extra) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, extra || {}),
  });
}

function allowList(env) {
  const raw = (env.ALLOW_ORIGINS || "").trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function corsHeaders(env, origin) {
  const allowed = allowList(env);
  const ok = origin && (allowed.includes(origin) || /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(workers\.dev|pages\.dev)$/i.test(origin));
  const h = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Range",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (ok) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes) {
  let bin = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function textToB64url(str) {
  return bytesToB64url(new TextEncoder().encode(str));
}

async function getJwks() {
  const now = Date.now();
  if (jwksCache.keys && now - jwksCache.fetchedAt < 3600 * 1000) return jwksCache.keys;
  const res = await fetch(JWKS_URL, { cf: { cacheTtl: 3600 } });
  if (!res.ok) throw new Error("jwks_fetch_failed");
  const data = await res.json();
  jwksCache = { keys: data.keys || [], fetchedAt: now };
  return jwksCache.keys;
}

async function verifyIdToken(idToken, projectId) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) throw new Error("bad_token");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) throw new Error("token_expired");
  if (payload.aud !== projectId) throw new Error("bad_audience");
  if (payload.iss !== "https://securetoken.google.com/" + projectId) throw new Error("bad_issuer");
  if (!payload.sub) throw new Error("no_subject");
  const keys = await getJwks();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("no_matching_key");
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signed = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]), signed);
  if (!valid) throw new Error("bad_signature");
  return payload;
}

function fsDocUrl(projectId, path) {
  return "https://firestore.googleapis.com/v1/projects/" + projectId + "/databases/(default)/documents/" + path;
}

async function firestoreGet(projectId, path, idToken) {
  const res = await fetch(fsDocUrl(projectId, path), { headers: { Authorization: "Bearer " + idToken } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("firestore_" + res.status);
  return res.json();
}

function tsToMs(value) {
  if (!value || typeof value !== "object") return 0;
  if (value.timestampValue) return Date.parse(value.timestampValue) || 0;
  if (value.integerValue) return Number(value.integerValue) * 1000;
  if (value.stringValue) return Date.parse(value.stringValue) || 0;
  return 0;
}

async function accessInfo(env, idToken, uid) {
  const projectId = env.FIREBASE_PROJECT_ID;
  const [adminDoc, userDoc] = await Promise.all([
    firestoreGet(projectId, "admins/" + uid, idToken).catch(() => null),
    firestoreGet(projectId, "users/" + uid, idToken).catch(() => null),
  ]);
  const memberMs = userDoc && userDoc.fields && userDoc.fields.memberUntil ? tsToMs(userDoc.fields.memberUntil) : 0;
  const isAdmin = !!adminDoc;
  const isMember = memberMs > Date.now();
  return { isAdmin, isMember, memberMs };
}

async function hmacKey(env) {
  const secret = env.TOKEN_SECRET || "novel-audio-signing-" + (env.FIREBASE_PROJECT_ID || "default");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function makeSignature(env, key, exp) {
  const k = await hmacKey(env);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(key + ":" + exp));
  return bytesToB64url(sig);
}

async function checkSignature(env, key, exp, sig) {
  const k = await hmacKey(env);
  const data = new TextEncoder().encode(key + ":" + exp);
  return crypto.subtle.verify("HMAC", k, b64urlToBytes(sig), data);
}

function bearer(request) {
  const h = request.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : "";
}

function safeKey(raw) {
  const key = String(raw || "").trim().replace(/^\/+/, "");
  if (!key || key.length > 400) return null;
  if (key.includes("..") || key.includes("\\")) return null;
  if (!/^[A-Za-z0-9._\-\/]+$/.test(key)) return null;
  return key;
}

async function handleSign(request, env, cors) {
  const idToken = bearer(request);
  if (!idToken) return json({ error: "UNAUTHENTICATED" }, 401, cors);
  let payload;
  try {
    payload = await verifyIdToken(idToken, env.FIREBASE_PROJECT_ID);
  } catch (e) {
    return json({ error: "BAD_TOKEN", detail: String(e.message || e) }, 401, cors);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "BAD_JSON" }, 400, cors);
  }
  const key = safeKey(body && body.key);
  if (!key) return json({ error: "BAD_KEY" }, 400, cors);
  const access = await accessInfo(env, idToken, payload.sub);
  if (!access.isAdmin && !access.isMember) return json({ error: "MEMBERS_ONLY" }, 403, cors);
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const sig = await makeSignature(env, key, exp);
  const url = new URL(request.url);
  const signed = url.origin + "/audio?k=" + encodeURIComponent(key) + "&exp=" + exp + "&sig=" + sig;
  return json({ url: signed, expiresAt: exp * 1000, memberUntil: access.memberMs || null, isAdmin: access.isAdmin }, 200, cors);
}

async function handleUpload(request, env, cors) {
  const idToken = bearer(request);
  if (!idToken) return json({ error: "UNAUTHENTICATED" }, 401, cors);
  let payload;
  try {
    payload = await verifyIdToken(idToken, env.FIREBASE_PROJECT_ID);
  } catch (e) {
    return json({ error: "BAD_TOKEN", detail: String(e.message || e) }, 401, cors);
  }
  const access = await accessInfo(env, idToken, payload.sub);
  if (!access.isAdmin) return json({ error: "ADMIN_ONLY" }, 403, cors);
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get("key"));
  if (!key) return json({ error: "BAD_KEY" }, 400, cors);
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > MAX_UPLOAD_BYTES) return json({ error: "TOO_LARGE" }, 413, cors);
  const contentType = request.headers.get("Content-Type") || "application/octet-stream";
  await env.AUDIO.put(key, request.body, {
    httpMetadata: { contentType, cacheControl: "private, max-age=0" },
  });
  return json({ ok: true, key, size: len }, 200, cors);
}

async function handleAudio(request, env) {
  const url = new URL(request.url);
  const key = safeKey(url.searchParams.get("k"));
  const exp = Number(url.searchParams.get("exp") || 0);
  const sig = url.searchParams.get("sig") || "";
  if (!key || !exp || !sig) return new Response("not found", { status: 404 });
  if (exp * 1000 < Date.now()) return new Response("expired", { status: 410 });
  let ok = false;
  try {
    ok = await checkSignature(env, key, exp, sig);
  } catch {
    ok = false;
  }
  if (!ok) return new Response("forbidden", { status: 403 });

  const range = request.headers.get("Range");
  const head = await env.AUDIO.head(key);
  if (!head) return new Response("missing", { status: 404 });
  const size = head.size;
  const type = (head.httpMetadata && head.httpMetadata.contentType) || "audio/mpeg";
  const base = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=300",
  };

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (Number.isFinite(start) && start <= end) {
        const obj = await env.AUDIO.get(key, { range: { offset: start, length: end - start + 1 } });
        if (!obj) return new Response("missing", { status: 404 });
        return new Response(obj.body, {
          status: 206,
          headers: Object.assign({}, base, {
            "Content-Range": "bytes " + start + "-" + end + "/" + size,
            "Content-Length": String(end - start + 1),
          }),
        });
      }
    }
  }

  const obj = await env.AUDIO.get(key);
  if (!obj) return new Response("missing", { status: 404 });
  return new Response(obj.body, { status: 200, headers: Object.assign({}, base, { "Content-Length": String(size) }) });
}

async function handleWhoAmI(request, env, cors) {
  const idToken = bearer(request);
  if (!idToken) return json({ error: "UNAUTHENTICATED" }, 401, cors);
  let payload;
  try {
    payload = await verifyIdToken(idToken, env.FIREBASE_PROJECT_ID);
  } catch (e) {
    return json({ error: "BAD_TOKEN", detail: String(e.message || e) }, 401, cors);
  }
  const access = await accessInfo(env, idToken, payload.sub);
  return json({ uid: payload.sub, email: payload.email || null, isAdmin: access.isAdmin, isMember: access.isMember, memberUntil: access.memberMs || null }, 200, cors);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(env, origin);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname === "/health") {
      return json({ ok: true, bucket: !!env.AUDIO, project: env.FIREBASE_PROJECT_ID || null }, 200, cors);
    }
    if (url.pathname === "/audio") {
      return handleAudio(request, env);
    }
    if (url.pathname === "/sign" && request.method === "POST") {
      return handleSign(request, env, cors);
    }
    if (url.pathname === "/upload" && request.method === "POST") {
      return handleUpload(request, env, cors);
    }
    if (url.pathname === "/whoami") {
      return handleWhoAmI(request, env, cors);
    }
    return json({ error: "NOT_FOUND" }, 404, cors);
  },
};
