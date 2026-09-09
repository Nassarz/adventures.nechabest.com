import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export type AdminCheckResult = {
  ok: boolean;
  status: number;
  error?: string;
  userId?: string;
  email?: string;
};

function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function extractEnvKey(value: string | undefined, prefix: 'pk' | 'sk'): string {
  if (!value) return '';
  const normalized = value.replace(/\$/g, '').trim();
  const pattern = prefix === 'pk'
    ? /(pk_(?:test|live)_[A-Za-z0-9._-]+)/
    : /(sk_(?:test|live)_[A-Za-z0-9._-]+)/;
  const match = normalized.match(pattern);
  return match?.[1] || '';
}

function getEmailFromSessionClaims(sessionClaims: unknown): string | undefined {
  if (!sessionClaims || typeof sessionClaims !== 'object') return undefined;
  const claims = sessionClaims as Record<string, unknown>;
  if (typeof claims.email === 'string' && claims.email.trim()) return claims.email.toLowerCase();
  if (typeof claims.primary_email_address === 'string' && claims.primary_email_address.trim())
    return claims.primary_email_address.toLowerCase();
  return undefined;
}

export async function requireAdminAccess(): Promise<AdminCheckResult> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const cookieStore = await cookies();
      const devSession = cookieStore.get('dev_admin_session');
      if (devSession?.value === 'authenticated') {
        return { ok: true, status: 200, userId: 'dev-local', email: 'dev@localhost' };
      }
      if (process.env.DEV_SKIP_ADMIN_AUTH === 'true') {
        return { ok: true, status: 200, userId: 'dev-bypass', email: 'dev@bypass' };
      }
      return { ok: false, status: 401, error: 'Unauthorized' };
    }

    const publishableKey = extractEnvKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'pk');
    const secretKey = extractEnvKey(process.env.CLERK_SECRET_KEY, 'sk');

    if (!publishableKey || !secretKey) {
      return { ok: false, status: 503, error: 'Authentication service not configured' };
    }

    if (!publishableKey.startsWith('pk_live_') || !secretKey.startsWith('sk_live_')) {
      return { ok: false, status: 503, error: 'Authentication service not configured' };
    }

    const { userId, sessionClaims } = await auth();
    const emailFromClaims = getEmailFromSessionClaims(sessionClaims);

    if (!userId) return { ok: false, status: 401, error: 'Unauthorized' };

    const adminEmails = parseAdminEmails();
    if (adminEmails.length === 0) {
      return { ok: false, status: 403, error: 'Admin allowlist is not configured.' };
    }

    let primaryEmail = emailFromClaims;
    if (!primaryEmail) {
      try {
        const user = await currentUser();
        primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      } catch {
        return { ok: false, status: 401, error: 'Unable to verify user identity' };
      }
    }

    if (!primaryEmail) return { ok: false, status: 403, error: 'No email address found.' };
    if (!adminEmails.includes(primaryEmail)) {
      return { ok: false, status: 403, error: 'Forbidden: Admin access required' };
    }

    return { ok: true, status: 200, userId, email: primaryEmail };
  } catch {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
}
