import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

const SITE_URL = 'https://emam-r8r5.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'رفيق الإمام — Imam Companion',
    template: '%s | رفيق الإمام',
  },
  description: 'رفيق يومي للقرآن، التحضير للصلاة، الحفظ، الأذكار، التعلم الإسلامي والاستماع إلى التلاوات',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: SITE_URL,
    siteName: 'رفيق الإمام',
    title: 'رفيق الإمام — Imam Companion',
    description: 'رفيق يومي للقرآن، التحضير للصلاة، الحفظ، الأذكار، التعلم الإسلامي والاستماع إلى التلاوات',
    images: [
      {
        url: '/icon-512.svg',
        width: 512,
        height: 512,
        alt: 'رفيق الإمام',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'رفيق الإمام — Imam Companion',
    description: 'رفيق يومي للقرآن، التحضير للصلاة، الحفظ، الأذكار',
    images: ['/icon-512.svg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'رفيق الإمام',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#0B0F0D',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0F0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="min-h-screen bg-quran-bg text-quran-ivory antialiased">
        <OfflineIndicator />
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
