import { notFound } from 'next/navigation';
import { getStandardById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File, FileText as FileTextIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PublicStandardPage({ params }: { params: { id: string } }) {
  const standard = getStandardById(params.id);

  if (!standard) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
        <main className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{standard.name}</CardTitle>
                    <CardDescription>Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}</CardDescription>
                </CardHeader>
                <CardContent>
                    {standard.image && (
                        <div className="relative aspect-video w-full mb-6">
                            <Image src={standard.image} alt={standard.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="certificate document"/>
                        </div>
                    )}
                    {standard.description && <p className="text-lg text-muted-foreground">{standard.description}</p>}
                </CardContent>
            </Card>
            
            {standard.files && standard.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {standard.files.map(file => (
                    <Link key={file.name} href={file.url} download={file.name} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' ? <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" /> : <File className="h-6 w-6 text-green-500 flex-shrink-0" />}
                        <span className="text-md font-medium truncate">{file.name}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
        </main>
    </div>
  );
}
