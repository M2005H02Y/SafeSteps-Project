"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Workstation } from '@/lib/data';
import { getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function PageContent() {
    const searchParams = useSearchParams();
    const data = searchParams.get('data');

    if (!data) {
        return notFound();
    }
    
    let workstation: Workstation | null = null;
    try {
        const decodedData = atob(decodeURIComponent(data));
        workstation = JSON.parse(decodedData);
    } catch (e) {
        console.error("Failed to parse workstation data from URL", e);
        return notFound();
    }

    if (!workstation) {
        return notFound();
    }

    const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl break-words">{workstation.name}</CardTitle>
                        {workstation.description && <CardDescription className="break-words pt-2 text-base">{workstation.description}</CardDescription>}
                    </CardHeader>
                    {workstation.image && (
                        <CardContent>
                            <div className="relative aspect-video w-full">
                                <Image src={workstation.image} alt={workstation.name} fill className="rounded-lg object-cover" data-ai-hint="assembly line" />
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
                                        {workstation.tableData?.map((row, index) => (
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
                            <div key={file.url} className="flex items-center justify-between p-2 rounded-md border bg-background">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={file.url} download={file.name} target="_blank">
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
    );
}

export default function PublicWorkstationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
            <PageContent />
        </Suspense>
    )
}
