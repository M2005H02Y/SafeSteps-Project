"use client";

import { notFound } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File, FileText as FileTextIcon, Download, Link as LinkIcon, BookCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PublicStandardPage({ params }: { params: { id: string } }) {
  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getStandardById(params.id);
    if (s) {
      setStandard(s);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!standard) {
    notFound();
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <BookCheck className="h-10 w-10 text-primary"/>
            <div>
                <h1 className="text-3xl font-bold">{standard.name}</h1>
                <p className="text-muted-foreground">Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                                <Link href={file.url} download={file.name} className="text-primary hover:underline">
                                    <Download className="h-4 w-4"/>
                                </Link>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Lien vers l'application</CardTitle>
                        <CardDescription>Retourner à la page détaillée dans l'application principale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/standards/${standard.id}`}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Ouvrir dans WorkHub
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
