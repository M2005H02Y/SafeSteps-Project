"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Standard } from '@/lib/data';

// Helper function to safely decode a Base64 string to UTF-8
function b64_to_utf8(str: string): string {
    return decodeURIComponent(escape(atob(str)));
}

export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [standard, setStandard] = useState<Standard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedJson = b64_to_utf8(decodeURIComponent(dataParam));
        const decodedData = JSON.parse(decodedJson);
        setStandard(decodedData);
      } catch (e) {
        console.error("Failed to parse standard data from URL", e);
        setError("Les données du code QR sont corrompues ou invalides.");
      }
    } else {
        setError("Aucune donnée fournie pour afficher cette page. Veuillez scanner à nouveau un code QR valide.");
    }
  }, [dataParam]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Erreur de données</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement des données de la norme...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
       <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words text-3xl">{standard.name}</CardTitle>
                    <CardDescription className="break-words text-base">
                        Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full mb-4">
                        <Image src="https://placehold.co/800x450.png" alt={standard.name} layout="fill" className="rounded-lg object-cover" data-ai-hint="certificate document" />
                    </div>
                    {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
                    <p className="text-sm text-muted-foreground mt-4 text-center">L'image principale et les fichiers joints ne sont pas affichés sur cette page publique.</p>
                </CardContent>
            </Card>
        </div>
         <div className="space-y-6 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Information</CardTitle>
                    <CardDescription>Cet aperçu est généré à partir d'un code QR et peut ne pas contenir toutes les données. L'image est un placeholder.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>
    </main>
  );
}
