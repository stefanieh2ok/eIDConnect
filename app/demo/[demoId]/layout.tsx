import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';

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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-neutral-100 text-neutral-950">
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-3 sm:px-4">
        {children}
      </main>
    </div>
  );
}
