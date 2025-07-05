"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Loader2, File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicWorkstationPage({ params }: { params: { id: string } }) {
  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = JSON.parse(b64_to_utf8(decodeURIComponent(data)));
        setWorkstation(decodedData);
      } catch (e) {
        console.error("Failed to parse workstation data from URL", e);
      }
    }
  }, [searchParams]);

  if (!workstation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Chargement des instructions...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Votre sécurité est notre priorité. Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">WorkHub Central - Accès Public</h1>
      </header>
      <main className="p-4 md:p-8 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl break-words">{workstation.name}</CardTitle>
            {workstation.description && <CardDescription className="text-lg break-words">{workstation.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {workstation.image && (
              <div className="relative aspect-video w-full mb-6">
                <Image src={workstation.image} alt={workstation.name} layout="fill" className="rounded-lg object-cover" data-ai-hint="assembly line" />
              </div>
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
                      {tableHeaders.map((header) => <TableHead key={header} className="capitalize bg-muted/50">{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workstation.tableData.map((row, index) => (
                      <TableRow key={index}>
                        {tableHeaders.map((header) => <TableCell key={header}>{row[header]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {workstation.files && workstation.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workstation.files.map(file => (
                <a 
                  key={file.name} 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                    <span className="text-base font-medium truncate">{file.name}</span>
                  </div>
                  <Download className="h-5 w-5 text-muted-foreground"/>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Généré par WorkHub Central</p>
      </footer>
    </div>
  );
}
