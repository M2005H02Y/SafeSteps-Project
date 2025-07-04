export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40 font-body antialiased">
      <main className="container mx-auto py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}
