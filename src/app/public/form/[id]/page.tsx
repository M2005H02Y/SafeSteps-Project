"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

function PublicFormPageContent({ data }: { data: Form }) {
  const pdfFile = data.files?.find(f => f.type === 'pdf');

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="break-words">{data.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Type:</span>
                <Badge variant="secondary" className="whitespace-normal break-all">{data.type}</Badge>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold">Dernière mise à jour:</span>
                <span className="break-all">{data.lastUpdated}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pdfFile ? (
            <iframe src={pdfFile.url} className="w-full h-[80vh] border rounded-md" title={pdfFile.name}></iframe>
        ) : (
            <div className="text-center text-muted-foreground p-8">
                <p>Aucun fichier de prévisualisation disponible.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

function PageLoader() {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[80vh] w-full" />
      </CardContent>
    </Card>
  )
}

export default function PublicFormPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [data, setData] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam));
        setData(decodedData);
      } catch (e) {
        console.error("Failed to parse data from URL", e);
        setError(true);
      }
    } else {
      setError(true);
    }
    setLoading(false);
  }, [dataParam]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !data) {
    notFound();
  }

  return <PublicFormPageContent data={data} />;
}
