'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { Standard } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const [standard, setStandard] = useState<Standard | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(dataParam);
        const parsedData: Standard = JSON.parse(decodedData);
        setStandard(parsedData);
      } catch (error) {
        console.error("Failed to parse standard data from URL", error);
        setStandard(null);
      }
    }
  }, [searchParams]);

  if (!standard) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <Card>
        <CardHeader>
            <CardTitle className="text-3xl">{standard.name}</CardTitle>
            <CardDescription className="pt-2">
                Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {standard.image && (
                <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden border">
                    <Image src={standard.image} alt={standard.name} fill className="object-cover" data-ai-hint="certificate document"/>
                </div>
            )}
            {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
        </CardContent>
      </Card>

      {standard.files && standard.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {standard.files.map(file => (
                     <div key={file.name} className="flex items-center gap-3 p-2 rounded-md border bg-slate-100">
                        {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                  ))}
                </CardContent>
              </Card>
            )}
    </div>
  );
}
