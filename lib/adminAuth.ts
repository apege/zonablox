import { NextResponse } from "next/server";

const SECRET_KEY =
  process.env.ADMIN_SECRET_TOKEN ||
  "zonablox_super_secret_admin_session_key_2026";

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf-8");
  }
  const pad = str + "=".repeat((4 - (str.length % 4)) % 4);
  return atob(pad.replace(/-/g, "+").replace(/_/g, "/"));
}

export async function createAdminToken(username: string): Promise<string> {
  const enc = new TextEncoder();
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  });

  const payloadB64 = base64UrlEncode(payload);
  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadB64)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const rawSig = String.fromCharCode.apply(null, signatureArray);
  const signatureB64 = btoa(rawSig)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${payloadB64}.${signatureB64}`;
}

export async function verifyAdminToken(
  token?: string | null
): Promise<{ valid: boolean; username?: string }> {
  if (!token || !token.includes(".")) return { valid: false };

  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return { valid: false };

    const pad = (s: string) => s + "=".repeat((4 - (s.length % 4)) % 4);
    const rawSig = atob(pad(signatureB64.replace(/-/g, "+").replace(/_/g, "/")));
    const sigBytes = new Uint8Array(rawSig.length);
    for (let i = 0; i < rawSig.length; i++) {
      sigBytes[i] = rawSig.charCodeAt(i);
    }

    const key = await getHmacKey();
    const enc = new TextEncoder();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    if (!isValid) return { valid: false };

    const payloadJson = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}

export function getAdminTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export const ADMIN_COOKIE_NAME = "admin_session";
