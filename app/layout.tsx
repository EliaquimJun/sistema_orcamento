import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { LOGO_GRAMARMORES } from '@/lib/pdf-assets'
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gramarmoresorcamento.web.app'),
  title: 'Gramarmores - Sistema de Orçamentos',
  description: 'Sistema profissional de gestão de orçamentos para marmoraria',
  icons: {
    icon: LOGO_GRAMARMORES,
  },
  openGraph: {
    images: [
      {
        url: LOGO_GRAMARMORES,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: LOGO_GRAMARMORES,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
