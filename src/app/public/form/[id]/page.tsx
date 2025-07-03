"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';

export default function PublicFormPage() {
    const searchParams = useSearchParams();
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (!data) {
            setError("Aucune donnée fournie pour afficher cette page.");
            setLoading(false);
            return;
        }

        try {
            const decodedData = decodeURIComponent(data);
            const parsedData = JSON.parse(atob(decodedData));
            setForm(parsedData);
        } catch (e) {
            console.error("Failed to parse form data from URL", e);
            setError("Les données de la page sont corrompues ou illisibles.");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full max-w-4xl space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-screen w-full" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!form) {
        notFound();
    }

    const pdfFile = form.files?.find(f => f.type === 'pdf');

    return (
        <main className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl break-words">{form.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                             <div className="flex flex-col">
                                <span className="font-semibold text-foreground">Type:</span>
                                <span className="break-all">{form.type}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground">Dernière mise à jour:</span>
                                <span>{form.lastUpdated}</span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {pdfFile ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aperçu du formulaire</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <iframe src={pdfFile.url} className="w-full h-screen border rounded-md" title={pdfFile.name}></iframe>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-muted-foreground">
                                <p>Aucun aperçu PDF disponible pour ce formulaire.</p>
                            </div>
                        </CardContent>
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
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <a href={file.url} download={file.name} className="p-2 text-muted-foreground hover:text-primary">
                                    <Download className="h-4 w-4"/>
                                    <span className="sr-only">Télécharger</span>
                                </a>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}