"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form } from '@/lib/data';
import { b64_to_utf8, getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, File as FileIcon, FileSpreadsheet, FileText as FileTextIcon, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PublicFormPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = b64_to_utf8(data);
        const parsedData: Form = JSON.parse(decodedData);
        setForm(parsedData);
      } catch (error) {
        console.error("Failed to parse form data from URL", error);
        setForm(null);
      }
    }
  }, [searchParams]);

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Formulaire non trouvé</h1>
          <p className="text-muted-foreground">Les données pour ce formulaire sont invalides ou manquantes.</p>
        </div>
      </div>
    );
  }

  const pdfFile = form.files?.find(f => f.type === 'pdf');
  const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center bg-card p-6 rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold tracking-tight">{form.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}
            </p>
        </header>

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
                <div key={file.name} className="flex items-center justify-between p-2 rounded-md border bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
                      <Download className="h-4 w-4"/>
                      <span className="sr-only">Télécharger</span>
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
