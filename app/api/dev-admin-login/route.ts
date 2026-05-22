import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIdentifier, secureJson } from '@/lib/apiSecurity';

// This route only works in development mode
// In production it returns 404 immediately
export async function POST(request: NextRequest) {
  // Hard block in production - this endpoint must never be accessible in prod
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Rate limit: 5 attempts per 15 minutes per IP (brute-force protection)
  const ip = getClientIdentifier(request);
  const rateLimitError = checkRateLimit(`dev-login:${ip}`, {
    max: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please wait 15 minutes.',
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const { password } = body;

    const devPassword = process.env.DEV_ADMIN_PASSWORD;

    if (!devPassword) {
      return secureJson(
        { error: 'DEV_ADMIN_PASSWORD not configured in .env.local' },
        { status: 500 }
      );
    }

    if (!password || typeof password !== 'string') {
      return secureJson({ error: 'Password is required' }, { status: 400 });
    }

    if (password !== devPassword) {
      // Constant-time-ish delay to prevent timing attacks and brute force
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      return secureJson({ error: 'Invalid password' }, { status: 401 });
    }

    // Set a secure session cookie valid for 8 hours
    const cookieStore = await cookies();
    cookieStore.set('dev_admin_session', 'authenticated', {
      httpOnly: true,
      secure: (process.env.NODE_ENV as string) === 'production', // HTTPS in prod, HTTP ok on localhost
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return secureJson({ success: true });
  } catch {
    return secureJson({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.delete('dev_admin_session');
  return secureJson({ success: true });
}
