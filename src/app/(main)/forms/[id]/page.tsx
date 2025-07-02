"use client";

import { notFound, useRouter } from 'next/navigation';
import { forms } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Printer, File, FileText as FileTextIcon, Download } from 'lucide-react';
import QRCode from '@/components/qr-code';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const form = forms.find((f) => f.id === params.id);

  if (!form) {
    notFound();
  }
  
  const handlePrint = () => {
    window.print();
  };

  const pdfFile = form.files?.find(f => f.type === 'pdf');

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
                <CardTitle>{form.name}</CardTitle>
                <CardDescription>Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
            </CardHeader>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {pdfFile ? (
              <Card>
                  <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                  <CardContent>
                      <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
                  </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                    <p>Aucun aperçu disponible pour ce formulaire.</p>
                    <p className="text-sm">Téléchargez un PDF pour le voir ici.</p>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <QRCode />
            
            {form.files && form.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.files.map(file => (
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
          </div>
        </div>
      </main>
    </div>
  );
}
