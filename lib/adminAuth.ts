import { auth, currentUser } from '@clerk/nextjs/server';

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
  if (!value) {
    return '';
  }

  const normalized = value.replace(/\$/g, '').trim();
  const pattern = prefix === 'pk'
    ? /(pk_(?:test|live)_[A-Za-z0-9._-]+)/
    : /(sk_(?:test|live)_[A-Za-z0-9._-]+)/;
  const match = normalized.match(pattern);
  return match?.[1] || '';
}

function getEmailFromSessionClaims(sessionClaims: unknown): string | undefined {
  if (!sessionClaims || typeof sessionClaims !== 'object') {
    return undefined;
  }

  const claims = sessionClaims as Record<string, unknown>;
  const direct = claims.email;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.toLowerCase();
  }

  const primary = claims.primary_email_address;
  if (typeof primary === 'string' && primary.trim()) {
    return primary.toLowerCase();
  }

  return undefined;
}

export async function requireAdminAccess(): Promise<AdminCheckResult> {
  try {
    if (process.env.NODE_ENV === 'production') {
      const publishableKey = extractEnvKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'pk');
      const secretKey = extractEnvKey(process.env.CLERK_SECRET_KEY, 'sk');
      if (!publishableKey || !secretKey) {
        console.error('[AdminAuth] Clerk environment keys are missing or invalid in production');
        return { ok: false, status: 503, error: 'Authentication service not configured' };
      }
    }

    const { userId, sessionClaims } = await auth();
    const emailFromClaims = getEmailFromSessionClaims(sessionClaims);

    console.log('[AdminAuth] Checking access for:', emailFromClaims || '(email unavailable)');
    console.log('[AdminAuth] NODE_ENV:', process.env.NODE_ENV);

    // In development, allow local admin API usage without enforcing Clerk session.
    // This matches the admin UI behavior and avoids noisy fetch failures while coding.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AdminAuth] Development mode - allowing local admin access');
      return {
        ok: true,
        status: 200,
        userId: userId || 'dev-local-admin',
        email: emailFromClaims || 'dev@local',
      };
    }

    if (!userId) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }

    // In production, enforce the admin allowlist.
    const adminEmails = parseAdminEmails();
    console.log('[AdminAuth] Production mode - checking against allowlist:', adminEmails);

    if (adminEmails.length === 0) {
      return {
        ok: false,
        status: 403,
        error: 'Admin allowlist is not configured. Set ADMIN_EMAILS env variable.',
      };
    }

    let primaryEmail = emailFromClaims;
    if (!primaryEmail) {
      try {
        const user = await currentUser();
        primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      } catch (error) {
        console.error('[AdminAuth] Failed to resolve current user email:', error);
        return { ok: false, status: 401, error: 'Unable to verify user identity' };
      }
    }

    if (!primaryEmail || !adminEmails.includes(primaryEmail)) {
      console.log('[AdminAuth] Access denied - email not in allowlist');
      return { ok: false, status: 403, error: 'Forbidden: Admin access required' };
    }

    console.log('[AdminAuth] Access granted');
    return { ok: true, status: 200, userId, email: primaryEmail };
  } catch (error) {
    console.error('[AdminAuth] Error while checking admin access:', error);
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
}
