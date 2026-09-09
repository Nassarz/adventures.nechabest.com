import { NextRequest, NextResponse } from 'next/server';

// Rate Limiting
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  message?: string;
}

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

export function getClientIdentifier(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Input Sanitization
export function sanitizeString(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  const cleaned = value.trim().toLowerCase().replace(/[^\w@.\-+]/gi, '');
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : '';
}

export function sanitizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[^\d\s\-+()]/g, '').slice(0, 30);
}

export function sanitizePositiveInt(value: unknown, min = 1, max = 10_000): number {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function sanitizeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// Security Headers
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-store',
};

export function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function secureJson(body: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(body, init);
  return withSecurityHeaders(res);
}

// CORS
const ALLOWED_ORIGINS = [
  'https://adventures.nechabest.com',
  'https://nechabest.com',
  'https://nechabest.vercel.app',
];

function isAllowedOrigin(origin: string): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && origin === appUrl) return true;
  if (process.env.NODE_ENV === 'production') {
    return ALLOWED_ORIGINS.includes(origin);
  }
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function checkOrigin(request: NextRequest, strict = true): NextResponse | null {
  if (!strict) return null;
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (!isAllowedOrigin(origin)) {
    return secureJson({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// Honeypot / Bot Detection
export function isBotRequest(body: Record<string, unknown>): boolean {
  const gotcha = body['_gotcha'];
  return typeof gotcha === 'string' && gotcha.trim().length > 0;
}

// ObjectId Validation
export function isValidObjectId(id: unknown): boolean {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

// Admin Rate Limiting
export function checkAdminRateLimit(userId: string, request: NextRequest): NextResponse | null {
  const ip = getClientIdentifier(request);
  return checkRateLimit(`admin:${userId}:${ip}`, {
    max: 120,
    windowMs: 60 * 1000,
    message: 'Too many admin requests. Please slow down.',
  });
}
