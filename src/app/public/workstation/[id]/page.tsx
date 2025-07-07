"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet, Download, Loader2 } from 'lucide-react';

function PublicWorkstationPageContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const id = params.id;

  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    let wsData: Workstation | null = null;

    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(decodeURIComponent(dataParam));
        if (decodedData) {
          wsData = JSON.parse(decodedData) as Workstation;
        }
      } catch (error) {
        console.error("Failed to parse workstation data from URL", error);
      }
    }

    if (wsData) {
      setWorkstation(wsData);
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

  if (!workstation) {
    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive">Données du poste de travail non valides</h1>
            <p className="text-muted-foreground mt-2">Impossible de charger les données. Veuillez réessayer de scanner le code QR.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">{workstation.name}</h1>
        <Badge variant="secondary" className="mt-2 text-lg">{workstation.type}</Badge>
        {workstation.description && <p className="text-lg text-muted-foreground mt-2">{workstation.description}</p>}
      </header>

      {workstation.image && (
        <Card>
            <CardContent className="p-0">
                <div className="relative aspect-video w-full">
                    <Image src={workstation.image} alt={workstation.name} fill className="rounded-lg object-cover" data-ai-hint="assembly line" />
                </div>
            </CardContent>
        </Card>
      )}

      {workstation.files && workstation.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workstation.files.map(file => (
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

export default function PublicWorkstationPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PublicWorkstationPageContent params={params} />
        </Suspense>
    );
}
