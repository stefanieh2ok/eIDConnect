import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Demo – eIDConnect',
  description: 'Vertrauliche personalisierte Demo.',
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
