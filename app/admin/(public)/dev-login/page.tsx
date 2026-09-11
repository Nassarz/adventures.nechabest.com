import { redirect } from 'next/navigation';
import DevAdminLoginClient from './DevAdminLoginClient';

export default function DevAdminLoginPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/sign-in?redirect_url=/admin');
  }

  return <DevAdminLoginClient />;
}
