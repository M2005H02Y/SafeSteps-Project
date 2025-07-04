"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Standard } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, File as FileIcon, FileSpreadsheet, FileText as FileTextIcon, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const [standard, setStandard] = useState<Standard | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = b64_to_utf8(data);
        const parsedData: Standard = JSON.parse(decodedData);
        setStandard(parsedData);
      } catch (error) {
        console.error("Failed to parse standard data from URL", error);
        setStandard(null);
      }
    }
  }, [searchParams]);

  if (!standard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Norme non trouvée</h1>
          <p className="text-muted-foreground">Les données pour cette norme sont invalides ou manquantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center bg-card p-6 rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold tracking-tight">{standard.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}
            </p>
        </header>

        {standard.image && (
          <Card>
            <CardContent className="p-2">
              <div className="relative aspect-video w-full">
                  <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document" />
              </div>
            </CardContent>
          </Card>
        )}
        
        {standard.description && (
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground break-words">{standard.description}</p>
                </CardContent>
            </Card>
        )}

        {standard.files && standard.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {standard.files.map(file => (
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
