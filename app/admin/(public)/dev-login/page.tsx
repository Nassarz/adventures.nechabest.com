import { redirect } from 'next/navigation';
import DevAdminLoginClient from './DevAdminLoginClient';

// Hard block: this page must never be accessible in production.
// The admin layout already redirects to /sign-in (Clerk) in production,
// but this server-side guard is an extra layer of defence.
export default function DevAdminLoginPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/sign-in?redirect_url=/admin');
  }

  return <DevAdminLoginClient />;
}
