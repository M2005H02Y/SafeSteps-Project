import Image from 'next/image';
import type { ReactNode } from 'react';

const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/OCP_Group.svg/240px-OCP_Group.svg.png";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="p-4 bg-white shadow-md">
        <div className="container mx-auto flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-0.5">
                <Image src={logoUrl} alt="SafeSteps Logo" width={36} height={36} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">SafeSteps</h1>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
