
import { Cog } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="p-4 border-b bg-white">
        <div className="container mx-auto flex items-center gap-2">
           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Cog className="h-5 w-5"/>
          </div>
          <h1 className="text-xl font-bold">SGI - Vue Publique</h1>
        </div>
      </header>
      <main className="container mx-auto py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Système de Gestion Industrielle. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
