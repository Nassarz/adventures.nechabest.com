import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

// Always invoke clerkMiddleware to set up Clerk context in the request.
// Clerk will read keys from environment variables.
// If keys are missing or invalid, auth() will fail gracefully in server functions.
const clerkHandler = clerkMiddleware();

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {
  try {
    return await clerkHandler(req, evt);
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
