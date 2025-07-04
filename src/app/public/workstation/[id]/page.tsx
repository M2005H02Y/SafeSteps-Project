"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Download, File as FileIcon, FileSpreadsheet, FileText as FileTextIcon, Image as ImageIcon } from 'lucide-react';

export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const [workstation, setWorkstation] = useState<Workstation | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = b64_to_utf8(data);
        const parsedData: Workstation = JSON.parse(decodedData);
        setWorkstation(parsedData);
      } catch (error) {
        console.error("Failed to parse workstation data from URL", error);
        setWorkstation(null);
      }
    }
  }, [searchParams]);

  if (!workstation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Poste de travail non trouvé</h1>
          <p className="text-muted-foreground">Les données pour ce poste de travail sont invalides ou manquantes.</p>
        </div>
      </div>
    );
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center bg-card p-6 rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold tracking-tight">{workstation.name}</h1>
            {workstation.description && <p className="mt-2 text-lg text-muted-foreground">{workstation.description}</p>}
        </header>

        {workstation.image && (
          <Card>
            <CardContent className="p-2">
              <div className="relative aspect-video w-full">
                  <Image src={workstation.image} alt={workstation.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="assembly line" />
              </div>
            </CardContent>
          </Card>
        )}

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
                        {tableHeaders.map((header) => <TableCell key={header} className="whitespace-pre-wrap break-words">{row[header]}</TableCell>)}
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
                <div key={file.name} className="flex items-center justify-between p-2 rounded-md border bg-background">
                  <div className="flex items-center gap-3 min-w-0">
                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
                      <Download className="h-4 w-4"/>
                      <span className="sr-only">Télécharger</span>
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
