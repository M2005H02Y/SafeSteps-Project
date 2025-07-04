
"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Workstation, FileAttachment } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function PublicWorkstationPage() {
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

  let workstation: Workstation | null = null;
  try {
    workstation = JSON.parse(atob(decodeURIComponent(dataParam)));
  } catch (error) {
    console.error("Failed to parse workstation data from URL", error);
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

  if (!workstation) {
      return (
         <div className="flex items-center justify-center h-screen p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader><CardTitle>Données introuvables</CardTitle></CardHeader>
                <CardContent><p>Le poste de travail que vous recherchez n'a pas pu être trouvé.</p></CardContent>
            </Card>
        </div>
      );
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <main className="p-4 md:p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle className="break-words">{workstation.name}</CardTitle>
                  {workstation.description && <CardDescription className="break-words">{workstation.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                  <div className="relative aspect-video w-full mb-4">
                      <Image 
                        src={workstation.image || "https://placehold.co/600x400.png"} 
                        alt={workstation.name} 
                        width={800} 
                        height={450} 
                        className="rounded-lg w-full h-auto object-cover"
                        data-ai-hint="assembly line"
                      />
                  </div>
                   {!workstation.image && (
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            L'image et les fichiers ne sont pas chargés via le code QR. Pour voir tous les détails, veuillez consulter cet élément dans l'application principale.
                        </AlertDescription>
                    </Alert>
                   )}
              </CardContent>
            </Card>

            {workstation.tableData && workstation.tableData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Procédures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {tableHeaders.map((header) => <TableHead key={header} className="capitalize">{header}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workstation.tableData.map((row, index) => (
                                        <TableRow key={index}>
                                            {tableHeaders.map((header) => <TableCell key={header} className="break-words">{row[header]}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-6">
            {workstation.files && workstation.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fichiers joints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {workstation.files.map((file: FileAttachment) => (
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
