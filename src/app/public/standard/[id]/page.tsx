"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { BookCheck, FileText, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicStandardPage() {
    const searchParams = useSearchParams();
    const [standard, setStandard] = useState<Standard | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = JSON.parse(atob(data));
                setStandard(decodedData);
            } catch (e) {
                console.error("Failed to parse standard data from URL", e);
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
                <BookCheck />
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
                           <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (error || !standard) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
                {pageHeader}
                <main className="w-full max-w-4xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Erreur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{error || "Impossible d'afficher la norme."}</p>
                    </CardContent>
                  </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
            {pageHeader}
            <main className="w-full max-w-4xl space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="break-words">{standard.name}</CardTitle>
                        <CardDescription className="break-words">
                            Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {standard.image && (
                            <div className="relative aspect-video w-full mb-4">
                                <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" />
                            </div>
                        )}
                        {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
                    </CardContent>
                </Card>

                {standard.files && standard.files.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fichiers joints</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {standard.files.map(file => (
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
