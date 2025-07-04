"use client";

import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Workstation } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, File as FileIcon, FileText as FileTextIcon, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function PublicWorkstationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const [workstation, setWorkstation] = useState<Workstation | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataString = searchParams.get('data');
    if (dataString) {
      try {
        const decodedData = b64_to_utf8(decodeURIComponent(dataString));
        setWorkstation(JSON.parse(decodedData));
      } catch (e) {
        console.error("Failed to parse workstation data from URL", e);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen justify-center items-center p-6 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  if (!workstation) {
    return notFound();
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <main className="flex flex-col items-center p-4 md:p-8 bg-muted min-h-screen">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl break-words">{workstation.name}</CardTitle>
            {workstation.description && <CardDescription className="text-base break-words">{workstation.description}</CardDescription>}
          </CardHeader>
          {workstation.image && (
            <CardContent>
              <div className="relative aspect-video w-full">
                <Image src={workstation.image} alt={workstation.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="assembly line" />
              </div>
            </CardContent>
          )}
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
                <a key={file.name} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground"/>
                </a>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
