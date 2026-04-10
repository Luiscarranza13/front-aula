import { Inter } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { buildMetadata, coreKeywords, indexRobots, siteConfig } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport = {
  themeColor: '#0f172a',
  colorScheme: 'light dark',
};

export const metadata = {
  ...buildMetadata({
    path: '/',
    description: siteConfig.description,
    keywords: coreKeywords,
  }),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
  robots: indexRobots,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
