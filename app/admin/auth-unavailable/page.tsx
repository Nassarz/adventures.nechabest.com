import Link from 'next/link';

const isDev = process.env.NODE_ENV !== 'production';

export default function AdminAuthUnavailablePage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
      <section className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-8 shadow-[0_16px_45px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-bold text-black">Admin Access Unavailable</h1>
        <p className="mt-3 text-black/70">
          Admin authentication is currently unavailable. Please contact the site administrator.
        </p>

        {/* Only show config details in development — never expose this in production */}
        {isDev && (
          <>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Development info:</strong> Set these in your <code>.env.local</code> or Vercel
              Environment Variables, then redeploy:
            </div>

            <ul className="mt-4 space-y-2 text-sm text-black/80">
              <li>
                <code className="rounded bg-black/5 px-2 py-1">
                  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
                </code>
              </li>
              <li>
                <code className="rounded bg-black/5 px-2 py-1">CLERK_SECRET_KEY=sk_live_...</code>
              </li>
              <li>
                <code className="rounded bg-black/5 px-2 py-1">
                  ADMIN_EMAILS=owner@nechabest.org
                </code>
              </li>
              <li>
                <code className="rounded bg-black/5 px-2 py-1">MONGODB_URI=...</code>
              </li>
              <li>
                <code className="rounded bg-black/5 px-2 py-1">MONGODB_DB=nechabest</code>
              </li>
            </ul>
          </>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
          >
            Back to Home
          </Link>
          {isDev && (
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
            >
              Open Clerk Dashboard
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
