/**
 * API Security Middleware
 *
 * Centralised security utilities for all Next.js API routes.
 * Provides: rate limiting, input validation, sanitization,
 * security headers, and CORS protection.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// Rate Limiting (in-memory, per-process)
// For multi-instance production use Redis instead.
// ─────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Human-readable message shown when limit is exceeded */
  message?: string;
}

/**
 * Check rate limit for a given identifier (IP or email).
 * Returns null if within limit, or a 429 NextResponse if exceeded.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const key = `rl:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (entry.count >= options.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: options.message ?? 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  entry.count += 1;
  return null;
}

/**
 * Get the best available client identifier from a request.
 * Uses IP address with a fallback to a generic key.
 */
export function getClientIdentifier(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─────────────────────────────────────────────
// Input Sanitization
// ─────────────────────────────────────────────

/** Strip null bytes and dangerous control characters from a string. */
export function sanitizeString(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

/** Normalise and validate an email address. Returns '' if invalid. */
export function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  const cleaned = value.trim().toLowerCase().replace(/[^\w@.\-+]/gi, '');
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : '';
}

/** Allow only digits, spaces, hyphens, plus signs, and parentheses. */
export function sanitizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[^\d\s\-+()]/g, '').slice(0, 30);
}

/** Coerce a value to a positive integer, clamped to [min, max]. */
export function sanitizePositiveInt(
  value: unknown,
  min = 1,
  max = 10_000
): number {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/** Coerce a value to a non-negative number. */
export function sanitizeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// ─────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────

/** Standard security headers to attach to every API response. */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Enforce HTTPS for 1 year, including subdomains
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Prevent browsers from sniffing MIME types
  'Cache-Control': 'no-store',
};

/** Attach security headers to an existing NextResponse. */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Create a JSON response with security headers already applied. */
export function secureJson(
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const res = NextResponse.json(body, init);
  return withSecurityHeaders(res);
}

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  'https://nechabest.com',
  'https://www.nechabest.com',
  'https://nechabest.org',
  'https://www.nechabest.org',
  'https://nechabest.vercel.app',
];

/**
 * Validate the request Origin header.
 * Returns a 403 response if the origin is not allowed, otherwise null.
 * Pass `strict: false` to skip the check for public read-only endpoints.
 */
export function checkOrigin(
  request: NextRequest,
  strict = true
): NextResponse | null {
  if (!strict) return null;

  const origin = request.headers.get('origin');
  // Same-origin requests (e.g. SSR) have no Origin header — allow them.
  if (!origin) return null;

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return secureJson({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// ─────────────────────────────────────────────
// Honeypot / Bot Detection
// ─────────────────────────────────────────────

/**
 * Returns true if the submission looks like a bot.
 * Checks the `_gotcha` honeypot field.
 */
export function isBotRequest(body: Record<string, unknown>): boolean {
  const gotcha = body['_gotcha'];
  return typeof gotcha === 'string' && gotcha.trim().length > 0;
}

// ─────────────────────────────────────────────
// ObjectId Validation
// ─────────────────────────────────────────────

/** Returns true if the string is a valid 24-char hex MongoDB ObjectId. */
export function isValidObjectId(id: unknown): boolean {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

// ─────────────────────────────────────────────
// Enum Validation
// ─────────────────────────────────────────────

/** Validate a value is one of the allowed enum values. Returns '' if invalid. */
export function sanitizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | '' {
  if (typeof value !== 'string') return '';
  return (allowed as readonly string[]).includes(value) ? (value as T) : '';
}

// ─────────────────────────────────────────────
// URL Validation
// ─────────────────────────────────────────────

/** Validate a URL is HTTPS and optionally restrict to a specific hostname. */
export function isValidHttpsUrl(value: unknown, allowedHostname?: string): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (allowedHostname && url.hostname !== allowedHostname) return false;
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Admin Rate Limiting
// ─────────────────────────────────────────────

/**
 * Apply a standard rate limit to admin API routes.
 * 120 requests per minute per user ID.
 */
export function checkAdminRateLimit(
  userId: string,
  request: NextRequest
): NextResponse | null {
  const ip = getClientIdentifier(request);
  return checkRateLimit(`admin:${userId}:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
    message: 'Too many admin requests. Please slow down.',
  });
}
