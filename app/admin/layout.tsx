import { requireAdminAccess } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

type AdminRouteLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminRouteLayout({ children }: AdminRouteLayoutProps) {
  const adminCheck = await requireAdminAccess();

  if (!adminCheck.ok) {
    if (adminCheck.status === 503) {
      redirect('/admin/auth-unavailable');
    }

    if (adminCheck.status === 401) {
      redirect('/sign-in?redirect_url=/admin');
    }

    redirect('/?admin=forbidden');
  }

  return <>{children}</>;
}
