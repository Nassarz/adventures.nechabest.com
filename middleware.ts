import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const publishableKey = (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').replace(/\$/g, '').trim();
const secretKey = (process.env.CLERK_SECRET_KEY || '').replace(/\$/g, '').trim();
const isClerkConfigured = Boolean(publishableKey && secretKey);

const baseMiddleware = isClerkConfigured
  ? clerkMiddleware({
      publishableKey,
      secretKey,
    })
  : null;

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (!baseMiddleware) {
    return NextResponse.next();
  }

  try {
    return await baseMiddleware(req, evt);
  } catch (error) {
    // Keep the app available if Clerk middleware fails at the edge.
    console.error('[Middleware] Clerk middleware failed, falling back:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
