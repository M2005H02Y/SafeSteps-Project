import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
