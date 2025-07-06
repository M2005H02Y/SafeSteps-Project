
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}
