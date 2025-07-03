"use client";

import { notFound } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { File, FileText as FileTextIcon, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


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
       <div className="min-h-screen bg-gray-100 p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!standard) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
       <main className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{standard.name}</h1>
          <div className="text-lg text-muted-foreground mt-1">
            <Badge variant="secondary">{standard.category}</Badge>
            <span className="mx-2">|</span>
            <span>Version: {standard.version}</span>
          </div>
        </header>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardContent className="p-4">
                    {standard.image && (
                        <div className="relative aspect-video w-full mb-4">
                            <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document"/>
                        </div>
                    )}
                    {standard.description && <p className="text-muted-foreground">{standard.description}</p>}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                      <Link href={file.url} download={file.name} className="p-2 rounded-md hover:bg-muted">
                        <Download className="h-4 w-4"/>
                        <span className="sr-only">Télécharger</span>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}