import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo – eIDConnect',
  description: 'Vertrauliche personalisierte Demo.',
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
