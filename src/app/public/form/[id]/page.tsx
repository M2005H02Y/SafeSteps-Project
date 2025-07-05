"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form } from '@/lib/data';
import { b64_to_utf8, getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PublicFormPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(b64_to_utf8(decodeURIComponent(data)));
        setForm(decodedData);
      } catch (e) {
        console.error("Failed to parse form data from URL", e);
      }
    }
  }, [searchParams]);

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Chargement du formulaire...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Préparation des informations. Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  const pdfFile = form.files?.find(f => f.type === 'pdf');
  const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">WorkHub Central - Accès Public</h1>
      </header>
      <main className="p-4 md:p-8 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl break-words">{form.name}</CardTitle>
            <CardDescription className="text-lg break-words">
                Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}
            </CardDescription>
          </CardHeader>
        </Card>

        {pdfFile ? (
            <Card>
                <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
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
            </div>
            </Card>
        )}

        {form.files && form.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.files.map(file => (
                <a 
                  key={file.name} 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                    <span className="text-base font-medium truncate">{file.name}</span>
                  </div>
                  <Download className="h-5 w-5 text-muted-foreground"/>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Généré par WorkHub Central</p>
      </footer>
    </div>
  );
}
