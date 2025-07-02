import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHub Central - Vue Publique',
  description: 'Vue publique des ressources opérationnelles.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b">
            <div className="container mx-auto h-16 flex items-center px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    <h1 className="text-xl font-semibold">WorkHub Central</h1>
                </div>
            </div>
        </header>
        <main className="container mx-auto p-4 md:p-6">
            {children}
        </main>
        <footer className="container mx-auto p-4 md:p-6 text-center text-sm text-muted-foreground">
            Généré par WorkHub Central
        </footer>
    </div>
  );
}
