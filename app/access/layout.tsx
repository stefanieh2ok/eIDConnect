import type { ReactNode } from 'react';

/**
 * Zentrierter Hintergrund für alle Zugangsseiten; der eigentliche „iPhone“-Rahmen kommt aus IphoneFrame in den Pages.
 */
export default function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#f3f7ff]">
      {children}
    </div>
  );
}
