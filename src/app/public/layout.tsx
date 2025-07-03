import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-body antialiased">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">WorkHub Central</h1>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
