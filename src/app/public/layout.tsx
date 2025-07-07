import { Toaster } from '@/components/ui/toaster';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto max-w-4xl p-4">{children}</main>
      <Toaster />
    </div>
  );
}
