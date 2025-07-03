"use client";

import { useSearchParams, useParams, notFound } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { File, FileText as FileTextIcon } from 'lucide-react';

function PublicFormPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dataFound: Form | null | undefined = null;
    const encodedData = searchParams.get('data');

    if (encodedData) {
      try {
        dataFound = JSON.parse(atob(encodedData));
      } catch (e) {
        console.error("Failed to decode data from URL", e);
      }
    }
    
    if (!dataFound) {
      dataFound = getFormById(id);
    }
    
    if (dataFound) {
      setForm(dataFound);
    }

    setLoading(false);
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  if (!form) {
    notFound();
  }
  
  const pdfFile = form.files?.find(f => f.type === 'pdf');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{form.name}</CardTitle>
          <CardDescription className="text-base">Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
        </CardHeader>
        <CardContent>
            {pdfFile ? (
                <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg min-h-[400px] flex flex-col justify-center items-center">
                    <p>Aucun aperçu disponible pour ce formulaire.</p>
                </div>
            )}
        </CardContent>
      </Card>

      {form.files && form.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {form.files.map(file => (
              <div key={file.name} className="flex items-center gap-3 p-2 rounded-md border">
                {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{file.name}</span>
                <Badge variant="secondary" className="ml-auto">{file.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PublicFormPage() {
  return (
    <Suspense fallback={
        <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-[800px] w-full" />
        </div>
    }>
      <PublicFormPageContent />
    </Suspense>
  )
}
