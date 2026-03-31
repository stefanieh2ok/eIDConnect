import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';
import { AppStage } from '@/components/ui/AppStage';

type DemoLayoutProps = {
  children: ReactNode;
  params: Promise<{ demoId: string }>;
};

export default async function DemoLayout({
  children,
  params,
}: DemoLayoutProps) {
  const { demoId } = await params;
  const session = await getActiveDemoSession(demoId);

  if (!session) {
    redirect('/access/denied');
  }

  if (session.demoId !== demoId) {
    redirect('/access/denied');
  }

  return <AppStage>{children}</AppStage>;
}
