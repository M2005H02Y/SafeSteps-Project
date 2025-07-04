"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/lib/data';
import { FileText } from 'lucide-react';

// Helper function to safely decode a Base64 string to UTF-8
function b64_to_utf8(str: string): string {
    return decodeURIComponent(escape(atob(str)));
}

export default function PublicFormPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedJson = b64_to_utf8(decodeURIComponent(dataParam));
        const decodedData = JSON.parse(decodedJson);
        setForm(decodedData);
      } catch (e) {
        console.error("Failed to parse form data from URL", e);
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

  if (!form) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement des données du formulaire...</p>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words text-3xl">{form.name}</CardTitle>
                    <CardDescription className="break-words text-base">
                        Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg min-h-[400px]">
                        <FileText className="h-16 w-16 mb-4" />
                        <p className="font-semibold">Aperçu non disponible</p>
                        <p className="text-sm">Les aperçus de fichiers et les pièces jointes ne sont pas disponibles sur cette page publique.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Information</CardTitle>
                    <CardDescription>Cet aperçu est généré à partir d'un code QR et peut ne pas contenir toutes les données.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>
    </main>
  );
}
