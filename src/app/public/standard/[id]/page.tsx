"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { Standard } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

function PublicStandardPageContent({ data }: { data: Standard }) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="break-words">{data.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                  <span className="font-semibold">Catégorie:</span>
                  <Badge variant="secondary" className="whitespace-normal break-all">{data.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                  <span className="font-semibold">Version:</span>
                  <span className="break-all">{data.version}</span>
              </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.image && (
          <div className="relative aspect-video w-full mb-4">
            <Image src={data.image} alt={data.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document"/>
          </div>
        )}
        {data.description && <p className="text-muted-foreground break-words">{data.description}</p>}
      </CardContent>
    </Card>
  );
}

function PageLoader() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}


export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [data, setData] = useState<Standard | null>(null);
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
    // We can use Next.js notFound() to render a 404 page
    // but this requires the page to be a server component or have specific handling.
    // For a client component, a simple message is often sufficient.
     notFound();
  }

  return <PublicStandardPageContent data={data} />;
}
