"use client";

import { notFound, useRouter } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, File, FileText as FileTextIcon, Download } from 'lucide-react';
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
      <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/2" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[800px] w-full" />
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }
  
  const pdfFile = form.files?.find(f => f.type === 'pdf');

  return (
    <div className="flex flex-col h-full min-h-screen bg-muted/40">
      <header className="bg-background p-4 border-b">
        <h1 className="text-xl font-semibold">{form.name}</h1>
        <p className="text-sm text-muted-foreground">Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</p>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="space-y-6">
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
      </main>
    </div>
  );
}
