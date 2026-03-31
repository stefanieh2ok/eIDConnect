import type { Metadata } from 'next';
import { APP_DISPLAY_NAME } from '@/lib/branding';

export const metadata: Metadata = {
  title: `Demo – ${APP_DISPLAY_NAME}`,
  description: 'Vertrauliche personalisierte Demo.',
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      <main className="flex flex-1 flex-col items-center justify-center px-2 py-3">{children}</main>
    </div>
  );
}
