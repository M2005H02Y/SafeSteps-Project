"use client";

import { notFound } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { File, FileText as FileTextIcon, Download, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    notFound();
  }

  const pdfFile = form.files?.find(f => f.type === 'pdf');

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <FileText className="h-10 w-10 text-primary"/>
            <div>
                <h1 className="text-3xl font-bold">{form.name}</h1>
                <p className="text-muted-foreground">Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    </Header>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/forms/${form.id}`}>
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
