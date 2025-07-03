
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function StandardPublicPageContent({ standard }: { standard: Standard }) {
  return (
    <>
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <h1 className="text-xl font-semibold">WorkHub Central</h1>
        </div>
      </div>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="break-words">{standard.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground pt-1">
              <div className="break-words">
                Catégorie: <Badge variant="secondary" className="h-auto whitespace-normal">{standard.category}</Badge>
              </div>
              {standard.version && <div className="pt-1">Version: {standard.version}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {standard.image && (
                <div className="relative aspect-video w-full mb-4">
                    <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document"/>
                </div>
            )}
            {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
          </CardContent>
        </Card>
      </main>
    </>
  );
}


export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam) {
        throw new Error("Les données du QR code sont manquantes. Veuillez scanner à nouveau.");
      }
      
      const decodedData = atob(decodeURIComponent(dataParam));
      const parsedData: Standard = JSON.parse(decodedData);
      setStandard(parsedData);
    } catch (e: any) {
        console.error("Failed to parse standard data from URL", e);
        setError(e.message || "Impossible de charger les données. Le QR code est peut-être invalide ou obsolète.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Alert variant="destructive" className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!standard) {
    return (
         <div className="flex justify-center items-center min-h-screen p-4">
            <Alert variant="destructive" className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>Impossible d'afficher la norme. Aucune donnée trouvée.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return <StandardPublicPageContent standard={standard} />;
}
