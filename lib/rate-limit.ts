import { NextResponse } from "next/server";
import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Per-user keys avoid blocking all traffic when IP is shared (Vercel, classroom Wi‑Fi). */
export function authRateLimitKey(
  action: "login" | "register" | "forgot-password",
  email: string,
  request: Request
): string {
  const normalized = email.trim().toLowerCase();
  const ip = getClientIp(request);
  return `${action}:${normalized}:${ip}`;
}

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const admin = tryCreateAdminClient();

  if (admin) {
    try {
      const { data, error } = await admin.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });

      if (!error && data && typeof data === "object" && data !== null) {
        const result = data as { ok?: boolean; retry_after_sec?: number };
        if (result.ok === true) return { ok: true };
        if (result.ok === false) {
          return {
            ok: false,
            retryAfterSec: result.retry_after_sec ?? 60,
          };
        }
      }

      if (error?.message.includes("does not exist")) {
        logger.warn("check_rate_limit RPC missing — using in-memory fallback");
      }
    } catch (rateError) {
      logger.warn("Supabase rate limit failed — using in-memory fallback", {
        error: String(rateError),
      });
    }
  }

  return checkRateLimitMemory(key, limit, windowMs);
}

export function rateLimitResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "יותר מדי בקשות — נסה שוב בעוד כמה דקות" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
