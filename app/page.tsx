import { cookies } from 'next/headers';
import { ADMIN_DEMO_COOKIE, verifyAdminDemoCookie } from '@/lib/security/admin-demo';
import { AppStage } from '@/components/ui/AppStage';
import HomeContent from './HomeContent';

/**
 * Startseite: HookAI Zugang (Link einfügen / Zugang anfordern).
 * Der Setup-Link im Footer wird nur angezeigt, wenn ein gültiger Admin-Demo-Cookie
 * gesetzt ist (z. B. nach /api/admin/enter-demo). Normale Besucher sehen ihn nicht.
 */
export default async function Home() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_DEMO_COOKIE)?.value;
  const secret = process.env.ADMIN_DEMO_SECRET;
  const showSetupLink = !!(
    secret &&
    adminCookie &&
    verifyAdminDemoCookie(secret, adminCookie)
  );

  return (
    <AppStage>
      <HomeContent showSetupLink={showSetupLink} />
    </AppStage>
  );
}
