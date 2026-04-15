import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getActiveDemoSession } from '@/lib/security/session';
import { Watermark } from '@/components/security/Watermark';

type DemoLayoutProps = {
  children: ReactNode;
  params: Promise<{ demoId: string }>;
};

export default async function DemoLayout({
  children,
  params,
}: DemoLayoutProps) {
  const { demoId } = await params;
  console.log('[DemoLayout] checking session for demoId:', demoId);
  const session = await getActiveDemoSession(demoId);

  if (!session) {
    console.log('[DemoLayout] no session → redirect /access/denied');
    redirect('/access/denied');
  }

  if (session.demoId !== demoId) {
    console.log('[DemoLayout] demoId mismatch session.demoId:', session.demoId, '!= requested:', demoId, '→ redirect /access/denied');
    redirect('/access/denied');
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-200 text-neutral-950">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
