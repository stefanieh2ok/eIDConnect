'use client';

import { useEffect } from 'react';

/**
 * history.scrollRestoration darf nicht per <script> im manuellen <head> laufen
 * (App Router: kein eigenes <head> — sonst Hydration-Probleme). Client-only ist ausreichend.
 */
export function ScrollRestoration() {
  useEffect(() => {
    try {
      if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
