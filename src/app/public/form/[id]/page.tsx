"use client";

import { notFound } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <div className="p-4 md:p-6 space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-[800px] w-full" />
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

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
        <h1 className="flex-1 text-xl md:text-2xl font-semibold tracking-tight">{form.name}</h1>
        <Button onClick={handlePrint}>Imprimer</Button>
      </header>
      
      <main className="flex-1 p-4 md:p-6 space-y-6 printable-area">
        <Card>
            <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription>Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
            </CardHeader>
        </Card>

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
      </main>
    </div>
  );
}
