"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Standard } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet, Download, Loader2 } from 'lucide-react';

function PublicStandardPageContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const id = params.id;

  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    let sData: Standard | null = null;

    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(decodeURIComponent(dataParam));
        if (decodedData) {
          sData = JSON.parse(decodedData) as Standard;
        }
      } catch (error) {
        console.error("Failed to parse standard data from URL", error);
      }
    }

    if (sData) {
      setStandard(sData);
    }
    setLoading(false);
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="aspect-video w-full" />
      </div>
    );
  }

  if (!standard) {
    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive">Données du standard non valides</h1>
            <p className="text-muted-foreground mt-2">Impossible de charger les données. Veuillez réessayer de scanner le code QR.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{standard.name}</h1>
        <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-md">{standard.category}</Badge>
            <Badge variant="secondary" className="text-md">Version: {standard.version}</Badge>
        </div>
        {standard.description && <p className="text-lg text-muted-foreground mt-2">{standard.description}</p>}
      </header>

      {standard.image && (
        <Card>
            <CardContent className="p-0">
                <div className="relative aspect-video w-full">
                    <Image src={standard.image} alt={standard.name} fill className="rounded-lg object-cover" data-ai-hint="certificate document" />
                </div>
            </CardContent>
        </Card>
      )}
      
      {standard.files && standard.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {standard.files.map(file => (
                <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md border bg-background/50 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                    <span className="text-base font-medium truncate">{file.name}</span>
                  </div>
                  <Download className="h-5 w-5 text-muted-foreground ml-2"/>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

export default function PublicStandardPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PublicStandardPageContent params={params} />
        </Suspense>
    );
}
