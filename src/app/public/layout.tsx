import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import '../globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'SGI - Vue Publique',
  description: 'Vue publique des informations du Système de Gestion Industrielle',
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 font-sans antialiased",
        fontSans.variable
      )}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
