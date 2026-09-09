import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const clerkHandler = clerkMiddleware();

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  try {
    return await clerkHandler(req, evt);
  } catch (error) {
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
