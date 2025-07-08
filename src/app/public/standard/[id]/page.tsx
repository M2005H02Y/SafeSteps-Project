import { notFound } from 'next/navigation';
import { getStandardById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default async function PublicStandardPage({ params }: { params: { id: string } }) {
  const standard = await getStandardById(params.id);

  if (!standard) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{standard.category}</Badge>
                {standard.version && <Badge variant="outline">Version {standard.version}</Badge>}
            </div>
          <CardTitle className="text-3xl">{standard.name}</CardTitle>
          <CardDescription className="text-sm pt-2">
            Dernière mise à jour le {format(new Date(standard.last_updated), "d MMMM yyyy", { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {standard.image && (
            <div className="relative aspect-video w-full mt-4 rounded-lg overflow-hidden border">
                <Image src={standard.image} alt={standard.name} fill className="object-cover" data-ai-hint="certificate document" />
            </div>
          )}
          {standard.description && <p className="mt-4 text-slate-700">{standard.description}</p>}
        </CardContent>
      </Card>
      
      {standard.files && standard.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {standard.files.map(file => (
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
