/**
 * Universal review token generator and decoder for customer order testimonials.
 * Uses standard base64 with URL-safe character mapping (- and _) to ensure
 * 100% compatibility across Node.js, Next.js Edge, and all web browsers without
 * relying on Node-specific Buffer 'base64url' encoding.
 */

export function generateReviewToken(orderCode: string): string {
  if (!orderCode) return "";
  const cleanCode = orderCode.trim();

  let base64 = "";
  if (typeof btoa === "function") {
    base64 = btoa(cleanCode);
  } else if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(cleanCode, "utf-8").toString("base64");
  } else {
    base64 = btoa(cleanCode);
  }

  // Convert standard base64 to RFC 4648 URL-safe base64
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeReviewToken(token: string): string | null {
  if (!token) return null;
  try {
    let base64 = token.trim().replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    if (typeof atob === "function") {
      return atob(base64).trim() || null;
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf-8").trim() || null;
    }

    return atob(base64).trim() || null;
  } catch {
    return null;
  }
}
