"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicFormPage() {
    const searchParams = useSearchParams();
    const [form, setForm] = useState<Form | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = JSON.parse(atob(data));
                setForm(decodedData);
            } catch (e) {
                console.error("Failed to parse form data from URL", e);
                setError("Les données n'ont pas pu être lues. Le code QR est peut-être invalide ou obsolète.");
            }
        } else {
            setError("Aucune donnée trouvée dans l'URL. Le code QR est peut-être invalide.");
        }
        setLoading(false);
    }, [searchParams]);

    const pageHeader = (
        <header className="flex items-center gap-3 mb-8 w-full max-w-4xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText />
            </div>
            <h1 className="text-2xl font-bold">WorkHub Central</h1>
        </header>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
                {pageHeader}
                <main className="w-full max-w-4xl space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-[600px] w-full" />
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    if (error || !form) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
                {pageHeader}
                <main className="w-full max-w-4xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Erreur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{error || "Impossible d'afficher le formulaire."}</p>
                    </CardContent>
                  </Card>
                </main>
            </div>
        )
    }

    const pdfFile = form.files?.find(f => f.type === 'pdf');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
            {pageHeader}
            <main className="w-full max-w-4xl space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="break-words">{form.name}</CardTitle>
                        <CardDescription>
                            Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}
                        </CardDescription>
                    </CardHeader>
                 </Card>

                {pdfFile ? (
                  <Card>
                      <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                      <CardContent>
                          <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
                      </CardContent>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center text-muted-foreground p-8">
                        <p>Aucun aperçu PDF disponible pour ce formulaire.</p>
                    </div>
                  </Card>
                )}

                {form.files && form.files.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fichiers joints</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {form.files.map(file => (
                        <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={file.url} download={file.name}>
                              <Download className="h-4 w-4"/>
                              <span className="sr-only">Télécharger</span>
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
            </main>
        </div>
    );
}
