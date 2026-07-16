import type { ReactNode } from 'react';

type CivicAppPageProps = {
  children: ReactNode;
  className?: string;
  /** Screen landmark für Scroll/QA (z. B. wegweiser-screen). */
  id?: string;
};

/**
 * Gemeinsame Seitenfläche für eingeloggte App-Module (Paket 1 UI-Fundament).
 */
export function CivicAppPage({ children, className = '', id }: CivicAppPageProps) {
  return (
    <div id={id} className={`civic-app-page civic-module-shell${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
