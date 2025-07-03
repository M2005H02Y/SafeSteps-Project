
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function FormPublicPageContent({ form }: { form: Form }) {
    const pdfFile = form.files?.find(f => f.type === 'pdf');
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
            <CardTitle className="break-words">{form.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground pt-1">
              <div className="break-words">
                Type: <Badge variant="secondary" className="h-auto whitespace-normal">{form.type}</Badge>
              </div>
              <div className="pt-1">
                Dernière mise à jour: {form.lastUpdated}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pdfFile ? (
                <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg flex flex-col items-center gap-4">
                    <FileText className="h-12 w-12" />
                    <p>Aucun aperçu disponible.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}


export default function PublicFormPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dataParam = searchParams.get('data');
      if (!dataParam) {
        throw new Error("Les données du QR code sont manquantes. Veuillez scanner à nouveau.");
      }
      
      const decodedData = atob(decodeURIComponent(dataParam));
      const parsedData: Form = JSON.parse(decodedData);
      setForm(parsedData);
    } catch (e: any) {
        console.error("Failed to parse form data from URL", e);
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

  if (!form) {
    return (
         <div className="flex justify-center items-center min-h-screen p-4">
            <Alert variant="destructive" className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>Impossible d'afficher le formulaire. Aucune donnée trouvée.</AlertDescription>
            </Alert>
        </div>
    );
  }

  return <FormPublicPageContent form={form} />;
}
