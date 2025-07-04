
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Standard, FileAttachment } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function PublicStandardPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  if (!dataParam) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Aucune donnée fournie pour afficher cette page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let standard: Standard | null = null;
  try {
    standard = JSON.parse(atob(decodeURIComponent(dataParam)));
  } catch (error) {
    console.error("Failed to parse standard data from URL", error);
    return (
       <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Les données de la page sont corrompues.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!standard) {
      return (
         <div className="flex items-center justify-center h-screen p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader><CardTitle>Données introuvables</CardTitle></CardHeader>
                <CardContent><p>La norme que vous recherchez n'a pas pu être trouvée.</p></CardContent>
            </Card>
        </div>
      );
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words">{standard.name}</CardTitle>
                    <CardDescription className="break-words">
                        Catégorie: <Badge variant="secondary">{standard.category}</Badge> | Version: {standard.version}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full mb-4">
                        <Image 
                            src={standard.image || "https://placehold.co/600x400.png"} 
                            alt={standard.name} 
                            width={800} 
                            height={450} 
                            className="rounded-lg w-full h-auto object-cover"
                            data-ai-hint="certificate document"
                        />
                    </div>
                    {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
                    {!standard.image && (
                     <div className="mt-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Information</AlertTitle>
                            <AlertDescription>
                                L'image et les fichiers ne sont pas chargés via le code QR. Pour voir tous les détails, veuillez consulter cet élément dans l'application principale.
                            </AlertDescription>
                        </Alert>
                     </div>
                   )}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {standard.files && standard.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {standard.files.map((file: FileAttachment) => (
                    <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={file.url} download={file.name}>
                          <Download className="h-4 w-4"/>
                          <span className="sr-only">Télécharger</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
  );
}
