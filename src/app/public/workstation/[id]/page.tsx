'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const [workstation, setWorkstation] = useState<Workstation | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(dataParam);
        const parsedData: Workstation = JSON.parse(decodedData);
        setWorkstation(parsedData);
      } catch (error) {
        console.error("Failed to parse workstation data from URL", error);
        setWorkstation(null);
      }
    }
  }, [searchParams]);

  if (!workstation) {
    // Show a loading/error state or redirect. For now, notFound is fine if data is invalid.
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{workstation.name}</CardTitle>
          <CardDescription className="pt-2 flex items-center gap-2">
            <Badge variant="secondary">{workstation.type}</Badge>
            <span>-</span>
            <span>{workstation.description}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workstation.image && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
              <Image src={workstation.image} alt={workstation.name} fill className="object-cover" data-ai-hint="assembly line" />
            </div>
          )}
        </CardContent>
      </Card>

      {workstation.files && workstation.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workstation.files.map(file => (
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
