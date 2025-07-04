
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FileAttachment } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function PublicFormPage() {
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

  let form: Form | null = null;
  try {
    form = JSON.parse(atob(decodeURIComponent(dataParam)));
  } catch (error) {
    console.error("Failed to parse form data from URL", error);
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

  if (!form) {
      return (
         <div className="flex items-center justify-center h-screen p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader><CardTitle>Données introuvables</CardTitle></CardHeader>
                <CardContent><p>Le formulaire que vous recherchez n'a pas pu être trouvé.</p></CardContent>
            </Card>
        </div>
      );
  }

  const pdfFile = form.files?.find(f => f.type === 'pdf');

  return (
    <main className="p-4 md:p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words">{form.name}</CardTitle>
                    <CardDescription className="break-words">Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
                </CardHeader>
                <CardContent>
                    {pdfFile ? (
                        <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
                    ) : (
                        <Card className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                                <p>Aucun aperçu disponible pour ce formulaire.</p>
                                <p className="text-sm">Téléchargez un PDF pour le voir ici.</p>
                                <div className="mt-4">
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Information</AlertTitle>
                                        <AlertDescription>
                                            Les fichiers ne sont pas chargés via le code QR. Pour voir tous les détails, veuillez consulter cet élément dans l'application principale.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>
                        </Card>
                    )}
                </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {form.files && form.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {form.files.map((file: FileAttachment) => (
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
