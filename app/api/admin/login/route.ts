import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Dev mode: accept any credentials
    if (process.env.NODE_ENV !== 'production') {
      if (email && password) {
        const response = NextResponse.json({ success: true });
        response.cookies.set('dev_admin_session', 'authenticated', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
        });
        return response;
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
