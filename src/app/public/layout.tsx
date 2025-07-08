import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SafeSteps - Accès Public',
  description: 'Consultation des informations publiques de SafeSteps.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <main className="w-full max-w-4xl p-4 md:p-8">
        {children}
      </main>
      <footer className="w-full mt-auto py-4">
        <div className="container mx-auto text-center text-sm text-slate-500 flex items-center justify-center gap-2">
           <span>Propulsé par</span>
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                <Image src="/logo.png" alt="SafeSteps Logo" width={20} height={20} className="object-contain" />
                <span>SafeSteps</span>
            </Link>
        </div>
      </footer>
    </div>
  );
}
