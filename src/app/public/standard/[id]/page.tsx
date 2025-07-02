"use client";

import { notFound } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div className="p-4 md:p-6 space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    );
  }

  if (!standard) {
    notFound();
  }
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
            <h1 className="flex-1 text-xl md:text-2xl font-semibold tracking-tight">{standard.name}</h1>
            <Button onClick={handlePrint}>Imprimer</Button>
        </header>

      <main className="flex-1 p-4 md:p-6 space-y-6 printable-area">
        <Card>
            <CardHeader>
                <CardTitle>{standard.name}</CardTitle>
                <CardDescription>Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
            </CardHeader>
            <CardContent>
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
