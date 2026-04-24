import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { ScrollRestoration } from '@/components/ScrollRestoration';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

/** Vercel: NEXT_PUBLIC_APP_URL muss absolute URL sein; sonst metadataBase wirft. */
function safeMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return new URL('http://localhost:3002');
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(href);
  } catch {
    return new URL('http://localhost:3002');
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#003366',
};

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: APP_DISPLAY_NAME,
  description: 'Moderne Bürgerbeteiligung mit KI-Unterstützung. Mitreden. Mitentscheiden. Mitgestalten.',
  openGraph: {
    title: APP_DISPLAY_NAME,
    description: 'Moderne Bürgerbeteiligung mit KI-Unterstützung. Mitreden. Mitentscheiden. Mitgestalten.',
    type: 'website',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary',
    title: APP_DISPLAY_NAME,
    description: 'Moderne Bürgerbeteiligung mit KI-Unterstützung.',
  },
};

/**
 * App Router: nur <html> + <body> — kein manuelles <head> (sonst Hydration / Client-Crash).
 * Meta über `metadata` / `viewport`; Styles in globals.css; ScrollRestoration clientseitig.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
