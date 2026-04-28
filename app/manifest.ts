import type { MetadataRoute } from 'next';
import { APP_DISPLAY_NAME, PWA_MANIFEST_CACHE_TAG } from '@/lib/branding';

/**
 * Erzwingt den angezeigten App-Namen für Install/Standalone (Android/iOS/PWA).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_DISPLAY_NAME,
    description: 'Digitale Identität · Beteiligung · Bürgerzugang — GovTech-Demo zu Orientierung und Mitwirkung.',
    start_url: `/?${PWA_MANIFEST_CACHE_TAG}=1`,
    display: 'standalone',
    background_color: '#F7F9FC',
    theme_color: '#003366',
    lang: 'de',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
