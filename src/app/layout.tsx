import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Life Sim Tracker',
  description: 'A life sim style task tracker for your goals and daily quests',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Life Sim',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d0d0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Main content area with bottom padding for nav */}
        <main className="pb-20 min-h-screen">
          {children}
        </main>
        
        {/* Bottom navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
