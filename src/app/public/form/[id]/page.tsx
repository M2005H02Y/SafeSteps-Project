'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Form } from '@/lib/data';
import { b64_to_utf8, getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

function PublicFormPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const data = searchParams.get('data');

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      try {
        const decodedData = b64_to_utf8(data);
        const parsedData = JSON.parse(decodedData);
        if (parsedData.id === id) {
          setForm(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse form data from URL", error);
      }
    }
    setLoading(false);
  }, [id, data]);

  if (loading) {
    return (
     <div className="p-4 md:p-8 space-y-6">
       <Skeleton className="h-12 w-3/4" />
       <Skeleton className="h-6 w-1/2" />
       <div className="space-y-6">
           <Skeleton className="h-[800px] w-full" />
           <Skeleton className="h-48 w-full" />
       </div>
     </div>
   );
 }
 
 if (!form) {
   return (
       <Card className="m-8">
           <CardHeader>
               <CardTitle className="text-destructive">Erreur de données</CardTitle>
           </CardHeader>
           <CardContent>
               <p>Les données pour ce formulaire n'ont pas pu être chargées à partir du code QR.</p>
               <p>Veuillez scanner un code QR valide.</p>
           </CardContent>
       </Card>
   );
 }
  
  const pdfFile = form.files?.find(f => f.type === 'pdf');
  const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

  return (
    <div className="p-4 md:p-8 space-y-6">
        <header>
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                Type: <Badge variant="secondary">{form.type}</Badge>
            </p>
        </header>

        {pdfFile ? (
          <Card>
              <CardHeader><CardTitle>Aperçu du formulaire (via IFrame)</CardTitle></CardHeader>
              <CardContent>
                  <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
              </CardContent>
          </Card>
        ) : mainImagePreview ? (
          <Card>
              <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
              <CardContent>
                <Image src={mainImagePreview} alt={form.name} width={800} height={1100} className="w-full h-auto rounded-md border" />
              </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <p>Aucun aperçu disponible pour ce formulaire.</p>
                <p className="text-sm">Téléchargez un PDF ou une image pour le voir ici.</p>
            </div>
          </Card>
        )}

        {form.files && form.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.files.map(file => (
                <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground ml-2"/>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

export default function PublicFormPage() {
    return <PublicFormPageContent />;
}
