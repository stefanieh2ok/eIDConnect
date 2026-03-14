import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';
import { DemoAppClient } from './DemoAppClient';

type PageProps = {
  params: Promise<{ demoId: string }>;
};

export default async function DemoPage({ params }: PageProps) {
  const { demoId } = await params;
  const session = await getActiveDemoSession();

  if (!session || session.demoId !== demoId) {
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
