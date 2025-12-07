import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Cursor Pro Voting | Blockchain Voting with ZKP',
  description:
    'Secure, private, and transparent blockchain voting powered by zero-knowledge proofs. Your vote, your privacy.',
  keywords: ['blockchain', 'voting', 'zkp', 'zero-knowledge', 'decentralized', 'privacy'],
  authors: [{ name: 'Cursor Pro Voting' }],
  openGraph: {
    title: 'Cursor Pro Voting',
    description: 'Blockchain Voting with Zero-Knowledge Proofs',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

