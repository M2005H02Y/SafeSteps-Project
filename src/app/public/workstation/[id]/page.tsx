"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function PublicWorkstationPage() {
    const searchParams = useSearchParams();
    const [workstation, setWorkstation] = useState<Workstation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (!data) {
            setError("Aucune donnée fournie pour afficher cette page.");
            setLoading(false);
            return;
        }

        try {
            const decodedData = decodeURIComponent(data);
            const parsedData = JSON.parse(atob(decodedData));
            setWorkstation(parsedData);
        } catch (e) {
            console.error("Failed to parse workstation data from URL", e);
            setError("Les données de la page sont corrompues ou illisibles.");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full max-w-4xl space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <Alert variant="destructive" className="max-w-lg">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!workstation) {
        notFound();
    }

    const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

    return (
        <main className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl break-words">{workstation.name}</CardTitle>
                        {workstation.description && <CardDescription className="text-base break-words">{workstation.description}</CardDescription>}
                    </CardHeader>
                    {workstation.image && (
                        <CardContent>
                            <div className="relative aspect-video w-full">
                                <Image src={workstation.image} alt={workstation.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" />
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
                                            {tableHeaders.map((header) => <TableHead key={header} className="capitalize break-words">{header}</TableHead>)}
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
                
                {workstation.files && workstation.files.length > 0 && (
                    <Card>
                        <CardHeader>
                        <CardTitle>Fichiers joints</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                        {workstation.files.map(file => (
                            <div key={file.name} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <a href={file.url} download={file.name} className="p-2 text-muted-foreground hover:text-primary">
                                    <Download className="h-4 w-4"/>
                                    <span className="sr-only">Télécharger</span>
                                </a>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}
