"use client";

import { notFound } from 'next/navigation';
import { getWorkstationById, Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { File, FileText as FileTextIcon, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function PublicWorkstationPage({ params }: { params: { id: string } }) {
  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkstationById(params.id);
    if (ws) {
      setWorkstation(ws);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40 p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!workstation) {
    notFound();
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
       <header className="bg-background p-4 border-b">
        <h1 className="text-xl font-semibold">{workstation.name}</h1>
        <p className="text-sm text-muted-foreground">{workstation.description}</p>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
          {workstation.image && (
            <Card>
              <CardContent className="pt-6">
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
                  <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex items-center gap-3">
                      {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
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
      </main>
    </div>
  );
}
