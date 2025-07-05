'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function PublicWorkstationPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const data = searchParams.get('data');

  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      try {
        const decodedData = b64_to_utf8(data);
        const parsedData = JSON.parse(decodedData);
        if (parsedData.id === id) {
          setWorkstation(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse workstation data from URL", error);
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
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!workstation) {
    return (
        <Card className="m-8">
            <CardHeader>
                <CardTitle className="text-destructive">Erreur de données</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Les données pour ce poste de travail n'ont pas pu être chargées à partir du code QR.</p>
                <p>Veuillez scanner un code QR valide.</p>
            </CardContent>
        </Card>
    );
  }
  
  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="p-4 md:p-8 space-y-6">
        <header>
            <h1 className="text-3xl font-bold">{workstation.name}</h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                <Badge variant="secondary">{workstation.type}</Badge> {workstation.description}
            </p>
        </header>
        
        {workstation.image && (
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video w-full">
                    <Image src={workstation.image} alt={workstation.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="assembly line" />
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

export default function PublicWorkstationPage() {
    return <PublicWorkstationPageContent />;
}
