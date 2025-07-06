'use client';

import { Suspense } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { b64_to_utf8 } from '@/lib/utils';
import { Workstation, FileAttachment } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Workstation type as we expect it from the QR code data.
// We will deliberately not use the 'procedures' field even if it exists in the data.
type PublicWorkstation = Omit<Workstation, 'id' | 'createdAt' | 'procedures'> & {
    procedures?: any; // Acknowledge it might exist, but we won't use it.
};

function WorkstationPublicPageContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  if (!dataParam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Données non valides</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Les données du poste de travail sont manquantes dans l'URL.</p>
        </CardContent>
      </Card>
    );
  }

  let workstation: PublicWorkstation;
  try {
    const decodedData = b64_to_utf8(dataParam);
    workstation = JSON.parse(decodedData);
  } catch (error) {
    console.error("Failed to parse workstation data from QR code:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur de décodage</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossible de lire les données du code QR. Il est peut-être corrompu ou obsolète.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!workstation || !workstation.name) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-4">
            <Building2 className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-slate-800">{workstation.name}</h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary">{workstation.type}</Badge>
                    <span>{workstation.description}</span>
                </p>
            </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Image du poste</CardTitle>
        </CardHeader>
        <CardContent>
          {workstation.image ? (
            <div className="relative aspect-video w-full">
              <Image src={workstation.image} alt={workstation.name} fill className="rounded-lg object-cover" data-ai-hint="assembly line" />
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune image disponible pour ce poste de travail.</p>
          )}
        </CardContent>
      </Card>

      {workstation.files && workstation.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workstation.files.map((file: FileAttachment) => (
              <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                  {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                  {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                  {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Download className="h-5 w-5 text-muted-foreground ml-2"/>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* The 'Procédures' section is intentionally not rendered here */}
    </div>
  );
}

function PageSkeleton() {
    return (
         <div className="space-y-6">
            <header className="space-y-2">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </div>
            </header>
            <Card>
                <CardHeader>
                     <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
         </div>
    )
}

export default function PublicWorkstationPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <WorkstationPublicPageContent />
        </Suspense>
    )
}
