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
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-950">
      <Watermark
        fullName={session.fullName}
        company={session.company}
        email={session.email || undefined}
        demoId={demoId}
      />

      <div className="fixed right-4 top-4 z-40 rounded-full border border-neutral-300 bg-white/90 px-4 py-2 text-xs shadow-sm backdrop-blur flex items-center gap-2">
        <span className="font-semibold">Personalisierter Demo-Zugang</span>
        <span className="text-neutral-600">
          {session.company || session.fullName}
        </span>
      </div>

      <main className="flex-1 min-h-0">{children}</main>

      <footer className="text-center py-2 px-3 text-xs text-gray-500 border-t border-gray-200 bg-white">
        Diese personalisierte Demo-Session wird zu Dokumentationszwecken protokolliert.
      </footer>
    </div>
  );
}
