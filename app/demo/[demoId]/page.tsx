import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';
import {
  getDevDemoEnterPath,
  isDevDemoAutoEnterEnabled,
} from '@/lib/security/dev-demo-enter-path';
import { DemoAppClient } from './DemoAppClient';

type PageProps = {
  params: Promise<{ demoId: string }>;
};

export default async function DemoPage({ params }: PageProps) {
  const { demoId } = await params;
  // demoId mitgeben, damit ein gueltiger Admin-Direktzugang-Cookie
  // (ADMIN_DEMO_COOKIE, gesetzt via /api/admin/open-demo bzw. enter-demo)
  // auch dann zaehlt, wenn keine normale Tester-Session existiert.
  const session = await getActiveDemoSession(demoId);

  if (!session || session.demoId !== demoId) {
    if (isDevDemoAutoEnterEnabled()) {
      redirect(getDevDemoEnterPath(demoId));
    }
    redirect('/access/denied');
  }

  return (
    <DemoAppClient
      tokenId={session.tokenId}
      sessionId={session.sessionId}
      recipientName={session.fullName}
      recipientOrg={session.company}
    />
  );
}
