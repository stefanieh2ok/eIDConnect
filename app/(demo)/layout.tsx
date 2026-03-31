import type { Metadata } from 'next';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { AppStage } from '@/components/ui/AppStage';

export const metadata: Metadata = {
  title: `Demo – ${APP_DISPLAY_NAME}`,
  description: 'Vertrauliche personalisierte Demo.',
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <AppStage>{children}</AppStage>;
}
