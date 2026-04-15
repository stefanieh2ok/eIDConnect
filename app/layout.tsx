import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1e40af',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  title: process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect',
  description: 'Demonstrationsumgebung.',
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect',
    description: 'Demonstrationsumgebung.',
    type: 'website',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect',
    description: 'Demonstrationsumgebung.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        {/* Browser-Kompatibilität: Edge & Chrome */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Verhindere Browser-spezifische Styling-Unterschiede */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Browser-Reset für konsistente Darstellung */
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            
            /* Edge-spezifische Fixes */
            @supports (-ms-ime-align: auto) {
              .ballot-checkbox {
                -ms-appearance: none;
              }
            }
            
            /* Chrome/Edge Chromium Konsistenz */
            input[type="radio"].ballot-checkbox,
            input[type="checkbox"].ballot-checkbox {
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
