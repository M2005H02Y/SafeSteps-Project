"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

function DataRenderer({ data }: { data: any }) {
    if (!data || typeof data !== 'object') return null;

    const isStandard = data.category && data.version;
    const isForm = data.lastUpdated && data.type;

    return (
        <div>
            <div className="flex flex-wrap gap-2 pt-2">
                {isStandard && <Badge variant="secondary">Catégorie: {data.category}</Badge>}
                {isStandard && <Badge variant="secondary">Version: {data.version}</Badge>}
                {isForm && <Badge variant="secondary">Type: {data.type}</Badge>}
                {isForm && <Badge variant="secondary">Mise à jour: {data.lastUpdated}</Badge>}
            </div>
            
            <div className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-center font-medium">Contenu limité</p>
                <p className="text-sm text-center">L'image principale, les fichiers joints et les tableaux de données ne sont pas affichés dans cet aperçu.</p>
            </div>
        </div>
    );
}

export default function PublicPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const encodedData = searchParams.get('data');
    if (encodedData) {
      try {
        const decodedString = atob(decodeURIComponent(encodedData));
        setData(JSON.parse(decodedString));
      } catch (error) {
        console.error("Failed to parse data from URL", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <Skeleton className="h-40 w-full mt-6" />
      </div>
    );
  }
  
  if (!data) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Erreur de Données</CardTitle>
          <CardDescription>Impossible de charger les informations. Le code QR est peut-être invalide ou obsolète. Veuillez réessayer.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold break-words">{data.name}</CardTitle>
        {data.description && <CardDescription className="text-base pt-1">{data.description}</CardDescription>}
      </CardHeader>
      <CardContent>
          <DataRenderer data={data} />
      </CardContent>
    </Card>
  );
}
