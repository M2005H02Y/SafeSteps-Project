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
      <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!workstation) {
    notFound();
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="flex flex-col h-full bg-background">
       <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
        <h1 className="flex-1 text-xl md:text-2xl font-semibold tracking-tight">{workstation.name}</h1>
        <Button onClick={handlePrint}>Imprimer</Button>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6 printable-area">
        <Card>
          <CardHeader>
              <CardTitle>{workstation.name}</CardTitle>
              <CardDescription>{workstation.description}</CardDescription>
          </CardHeader>
          <CardContent>
              {workstation.image && (
                  <div className="relative aspect-video w-full mb-4">
                      <Image src={workstation.image} alt={workstation.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="assembly line" />
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
