"use client";

import { notFound, useRouter, useParams } from 'next/navigation';
import { getStandardById, Standard } from '@/lib/data';
import { getCloudinaryImagePreview } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowLeft, Printer, File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import QRCode from '@/components/qr-code';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StandardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const s = getStandardById(id);
      if(s) {
          setStandard(s);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
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
    <div className="flex flex-col h-full">
      <div className="print-hidden">
        <PageHeader title={standard.name}>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </PageHeader>
      </div>

      <main className="flex-1 p-4 md:p-6 space-y-6 printable-area">
        <div className="md:hidden mb-4">
            <CardHeader className="p-0">
                <CardTitle className="break-words">{standard.name}</CardTitle>
                <CardDescription className="break-words">Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
            </CardHeader>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="hidden md:block">
                    <CardTitle className="break-words">{standard.name}</CardTitle>
                    <CardDescription className="break-words">Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
                </CardHeader>
                <CardContent>
                    {standard.image && (
                        <div className="relative aspect-video w-full mb-4">
                            <Image src={standard.image} alt={standard.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="certificate document"/>
                        </div>
                    )}
                    {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <QRCode type="standard" id={id} data={standard} />
            
            {standard.files && standard.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {standard.files.map(file => (
                    <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4"/>
                          <span className="sr-only">Télécharger</span>
                        </Link>
                      </Button>
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
