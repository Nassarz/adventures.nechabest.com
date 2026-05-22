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
    // ── Development mode: use local password session ──────────────────────
    if (process.env.NODE_ENV !== 'production') {
      const cookieStore = await cookies();
      const devSession = cookieStore.get('dev_admin_session');

      if (devSession?.value === 'authenticated') {
        console.log('[AdminAuth] DEV: Local admin session active');
        return { ok: true, status: 200, userId: 'dev-local', email: 'dev@localhost' };
      }

      // Explicit bypass flag (legacy support)
      if (process.env.DEV_SKIP_ADMIN_AUTH === 'true') {
        console.warn('[AdminAuth] DEV: Admin auth bypassed via DEV_SKIP_ADMIN_AUTH=true');
        return { ok: true, status: 200, userId: 'dev-bypass', email: 'dev@bypass' };
      }

      // No valid dev session → redirect to dev login
      return { ok: false, status: 401, error: 'Unauthorized' };
    }

    // ── Production mode: require valid Clerk live keys ────────────────────
    const publishableKey = extractEnvKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, 'pk');
    const secretKey = extractEnvKey(process.env.CLERK_SECRET_KEY, 'sk');

    if (!publishableKey || !secretKey) {
      console.error('[AdminAuth] Clerk environment keys are missing or invalid in production');
      return { ok: false, status: 503, error: 'Authentication service not configured' };
    }

    if (!publishableKey.startsWith('pk_live_') || !secretKey.startsWith('sk_live_')) {
      console.error('[AdminAuth] Production requires live Clerk keys (pk_live_/sk_live_)');
      return { ok: false, status: 503, error: 'Authentication service not configured' };
    }

    const { userId, sessionClaims } = await auth();
    const emailFromClaims = getEmailFromSessionClaims(sessionClaims);

    if (!userId) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }

    const adminEmails = parseAdminEmails();
    if (adminEmails.length === 0) {
      console.warn('[AdminAuth] ADMIN_EMAILS environment variable is empty or not set');
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

    if (!primaryEmail) {
      return { ok: false, status: 403, error: 'No email address found. Please verify your email in Clerk.' };
    }

    if (!adminEmails.includes(primaryEmail)) {
      console.warn(`[AdminAuth] Access denied - '${primaryEmail}' is not in allowlist`);
      return { ok: false, status: 403, error: 'Forbidden: Admin access required' };
    }

    console.log('[AdminAuth] Access granted for:', primaryEmail);
    return { ok: true, status: 200, userId, email: primaryEmail };
  } catch (error) {
    console.error('[AdminAuth] Error while checking admin access:', error);
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
}
