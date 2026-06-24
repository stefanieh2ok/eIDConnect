import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';
import {
  getDevDemoEnterPath,
  isDevDemoAutoEnterEnabled,
} from '@/lib/security/dev-demo-enter-path';
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
    if (isDevDemoAutoEnterEnabled()) {
      redirect(getDevDemoEnterPath(demoId));
    }
    redirect('/access/denied');
  }

  if (session.demoId !== demoId) {
    redirect('/access/denied');
  }

  return <AppStage>{children}</AppStage>;
}
