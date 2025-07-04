"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getWorkstationById, Workstation } from '@/lib/data';
import { b64_to_utf8, getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';

export default function PublicWorkstationPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [workstation, setWorkstation] = useState<Workstation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let data: Workstation | undefined | null = null;
        const encodedData = searchParams.get('data');
        
        if (encodedData) {
            try {
                const decodedJson = b64_to_utf8(decodeURIComponent(encodedData));
                data = JSON.parse(decodedJson);
            } catch (error) {
                console.error("Failed to parse data from URL", error);
                data = null;
            }
        }
        
        if (!data && id) {
            data = getWorkstationById(id);
        }

        if (data) {
          setWorkstation(data);
        }
        setLoading(false);

    }, [id, searchParams]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Card>
                    <CardContent className="pt-6">
                        <Skeleton className="w-full h-96" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="w-full h-48" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!workstation) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Poste de travail non trouvé</CardTitle>
                    <CardDescription>Désolé, nous n'avons pas pu trouver les informations pour ce poste de travail.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{workstation.name}</CardTitle>
                    <CardDescription>{workstation.description}</CardDescription>
                </CardHeader>
                {workstation.image && (
                    <CardContent>
                        <Image src={workstation.image} alt={workstation.name} width={1200} height={675} className="rounded-lg w-full h-auto object-cover border" data-ai-hint="assembly line" />
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
                <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {workstation.files.map(file => (
                    <div key={file.name} className="flex items-center justify-between p-3 rounded-md border bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-5 w-5"/>
                          <span className="sr-only">Télécharger</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
    );
}
