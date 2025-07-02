"use client";

import { notFound } from 'next/navigation';
import { getWorkstationById, Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { File, FileText as FileTextIcon, Download, Link as LinkIcon, Building2 } from 'lucide-react';
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
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!workstation) {
    notFound();
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Building2 className="h-10 w-10 text-primary"/>
            <div>
                <h1 className="text-3xl font-bold">{workstation.name}</h1>
                <p className="text-muted-foreground">{workstation.description}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {workstation.image && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Image du poste de travail</CardTitle>
                        </CardHeader>
                        <CardContent>
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
            </div>
            
            <div className="space-y-6">
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
                                <Link href={file.url} download={file.name} className="text-primary hover:underline">
                                    <Download className="h-4 w-4"/>
                                </Link>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                )}
                 <Card>
                    <CardHeader>
                        <CardTitle>Lien vers l'application</CardTitle>
                        <CardDescription>Retourner à la page détaillée dans l'application principale.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/workstations/${workstation.id}`}>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Ouvrir dans WorkHub
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
