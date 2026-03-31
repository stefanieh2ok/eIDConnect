import type { ReactNode } from 'react';
import { AppStage } from '@/components/ui/AppStage';

/**
 * Zentrierter Hintergrund für alle Zugangsseiten; der eigentliche „iPhone“-Rahmen kommt aus IphoneFrame in den Pages.
 */
export default function AccessLayout({ children }: { children: ReactNode }) {
  return <AppStage>{children}</AppStage>;
}
