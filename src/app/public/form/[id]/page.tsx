"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function PublicFormPageContent({ data }: { data: Form }) {
    return (
        <Card className="max-w-2xl mx-auto my-8 shadow-lg">
            <CardHeader className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <h1 className="text-xl font-semibold">WorkHub Central</h1>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold break-words">{data.name}</h2>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                   <div className="flex gap-2">
                        <span className="font-semibold shrink-0">Type:</span>
                        <span className="text-muted-foreground break-all">{data.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Dernière mise à jour:</span>
                        <span className="text-muted-foreground">{data.lastUpdated}</span>
                    </div>
                </div>
                 {data.files && data.files.find(f => f.type === 'pdf') ? (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Aperçu du formulaire</h3>
                        <iframe src={data.files.find(f => f.type === 'pdf')?.url} className="w-full h-[600px] border rounded-md" title={data.name}></iframe>
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                        <p>Aucun aperçu de document disponible.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

function PageLoader() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8">
                <div className="flex items-center gap-3 justify-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <h1 className="text-xl font-semibold">WorkHub Central</h1>
                </div>
                <p className="text-muted-foreground">Chargement des informations...</p>
                 <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        </div>
    )
}

function PageError({ message }: { message: string }) {
    return (
         <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Alert variant="destructive" className="max-w-md mx-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
        </div>
    )
}

export default function PublicFormPage() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<Form | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const dataParam = searchParams.get('data');
            if (!dataParam) {
                throw new Error("Les données de la page sont manquantes. Veuillez re-scanner le QR code.");
            }
            const decodedData = atob(decodeURIComponent(dataParam));
            const parsedData: Form = JSON.parse(decodedData);
            setData(parsedData);
        } catch (e: any) {
             if (e instanceof Error) {
                setError(`Impossible de décoder les données de la page. Essayez de générer un nouveau QR code. (${e.message})`);
            } else {
                setError("Une erreur inconnue est survenue.");
            }
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return <PageLoader />;
    }

    if (error) {
        return <PageError message={error} />;
    }

    if (!data) {
        notFound();
    }

    return <PublicFormPageContent data={data} />;
}
