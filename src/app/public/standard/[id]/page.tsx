"use client";

import { notFound } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File, FileText as FileTextIcon, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function PublicStandardPage({ params }: { params: { id: string } }) {
  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getStandardById(params.id);
    if(s) {
        setStandard(s);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-muted/40 p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  if (!standard) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-muted/40">
       <header className="bg-background p-4 border-b">
        <h1 className="text-xl font-semibold">{standard.name}</h1>
        <p className="text-sm text-muted-foreground">Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</p>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
            <CardContent className="pt-6">
                {standard.image && (
                    <div className="relative aspect-video w-full mb-4">
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
                <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-3">
                    {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
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
