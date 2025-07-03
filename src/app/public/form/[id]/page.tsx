"use client";

import { notFound } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, FileText as FileTextIcon, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicFormPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f = getFormById(params.id);
    if(f) {
        setForm(f);
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
            <Skeleton className="h-[800px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }
  
  const pdfFile = form.files?.find(f => f.type === 'pdf');

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{form.name}</h1>
          <div className="text-lg text-muted-foreground mt-1">
            <Badge variant="secondary">{form.type}</Badge>
            <span className="mx-2">|</span>
            <span>Dernière mise à jour: {form.lastUpdated}</span>
          </div>
        </header>

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