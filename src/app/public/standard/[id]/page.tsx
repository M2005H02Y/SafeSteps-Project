"use client";

import { useSearchParams, useParams, notFound } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getStandardById, Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { File, FileText as FileTextIcon } from 'lucide-react';

function PublicStandardPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dataFound: Standard | null | undefined = null;
    const encodedData = searchParams.get('data');

    if (encodedData) {
      try {
        dataFound = JSON.parse(atob(encodedData));
      } catch (e) {
        console.error("Failed to decode data from URL", e);
      }
    }
    
    if (!dataFound) {
      dataFound = getStandardById(id);
    }
    
    if (dataFound) {
      setStandard(dataFound);
    }

    setLoading(false);
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!standard) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{standard.name}</CardTitle>
          <CardDescription className="text-base">Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
        </CardHeader>
        <CardContent>
          {standard.image && (
            <div className="relative aspect-video w-full mb-6">
              <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document"/>
            </div>
          )}
           {standard.description && <p className="text-muted-foreground">{standard.description}</p>}
        </CardContent>
      </Card>

      {standard.files && standard.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {standard.files.map(file => (
              <div key={file.name} className="flex items-center gap-3 p-2 rounded-md border">
                {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{file.name}</span>
                <Badge variant="secondary" className="ml-auto">{file.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PublicStandardPage() {
  return (
    <Suspense fallback={
        <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    }>
      <PublicStandardPageContent />
    </Suspense>
  )
}
