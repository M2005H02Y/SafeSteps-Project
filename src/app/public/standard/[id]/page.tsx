"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';

export default function PublicStandardPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [standard, setStandard] = useState<Standard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let data: Standard | undefined | null = null;
        const encodedData = searchParams.get('data');
        
        if (encodedData) {
            try {
                const decodedJson = b64_to_utf8(decodeURIComponent(encodedData));
                data = JSON.parse(decodedJson);
            } catch (error) {
                console.error("Failed to parse data from URL", error);
                data = null;
            }
        }
        
        if (!data && id) {
            data = getStandardById(id);
        }

        if (data) {
          setStandard(data);
        }
        setLoading(false);

    }, [id, searchParams]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardContent className="pt-6">
                        <Skeleton className="w-full h-96" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!standard) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Norme non trouvée</CardTitle>
                    <CardDescription>Désolé, nous n'avons pas pu trouver les informations pour cette norme.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{standard.name}</CardTitle>
                    <CardDescription>Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {standard.image && (
                         <Image src={standard.image} alt={standard.name} width={1200} height={675} className="rounded-lg w-full h-auto object-cover border" data-ai-hint="certificate document" />
                    )}
                    {standard.description && <p className="text-muted-foreground break-words pt-4">{standard.description}</p>}
                </CardContent>
            </Card>

            {standard.files && standard.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {standard.files.map(file => (
                    <div key={file.name} className="flex items-center justify-between p-3 rounded-md border bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-5 w-5"/>
                          <span className="sr-only">Télécharger</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
    );
}
