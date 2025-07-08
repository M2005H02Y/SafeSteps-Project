import { notFound } from 'next/navigation';
import { getWorkstationById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';

export default async function PublicWorkstationPage({ params }: { params: { id: string } }) {
  const workstation = await getWorkstationById(params.id);

  if (!workstation) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit mb-2">{workstation.type}</Badge>
          <CardTitle className="text-3xl">{workstation.name}</CardTitle>
          {workstation.description && (
            <CardDescription className="text-base pt-2">{workstation.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {workstation.image && (
            <div className="relative aspect-video w-full mt-4 rounded-lg overflow-hidden border">
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
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workstation.files.map(file => (
              <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md border bg-slate-50 hover:bg-slate-100 transition-colors">
                {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{file.name}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
