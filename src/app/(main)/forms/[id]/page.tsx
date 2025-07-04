"use client";

import { notFound, useRouter, useParams } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { getCloudinaryImagePreview } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Printer, File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import QRCode from '@/components/qr-code';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const params_ = useParams();
  const id = params_.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const f = getFormById(id);
      if(f) {
          setForm(f);
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
            <Skeleton className="h-[800px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }
  
  const handlePrint = () => {
    window.print();
  };

  const pdfFile = form.files?.find(f => f.type === 'pdf');
  const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

  return (
    <div className="flex flex-col h-full">
      <div className="print-hidden">
        <PageHeader title={form.name}>
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
                <CardTitle className="break-words">{form.name}</CardTitle>
                <CardDescription className="break-words">Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
            </CardHeader>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {pdfFile ? (
              <Card>
                  <CardHeader><CardTitle>Aperçu du formulaire (via IFrame)</CardTitle></CardHeader>
                  <CardContent>
                      <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
                  </CardContent>
              </Card>
            ) : mainImagePreview ? (
              <Card>
                  <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                  <CardContent>
                    <Image src={mainImagePreview} alt={form.name} width={800} height={1100} className="w-full h-auto rounded-md border" />
                  </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                    <p>Aucun aperçu disponible pour ce formulaire.</p>
                    <p className="text-sm">Téléchargez un PDF ou une image pour le voir ici.</p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <QRCode type="form" id={id} data={form} />
            
            {form.files && form.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.files.map(file => (
                    <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={file.url} download={file.name} target="_blank">
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
