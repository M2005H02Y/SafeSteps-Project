"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Form } from '@/lib/data';
import { getCloudinaryImagePreview } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    
    let form: Form | null = null;
    try {
        const decodedData = atob(decodeURIComponent(data));
        form = JSON.parse(decodedData);
    } catch (e) {
        console.error("Failed to parse form data from URL", e);
        return notFound();
    }

    if (!form) {
        return notFound();
    }

    const pdfFile = form.files?.find(f => f.type === 'pdf');
    const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl break-words">{form.name}</CardTitle>
                        <CardDescription className="pt-2 text-base">
                            Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}
                        </CardDescription>
                    </CardHeader>
                    {mainImagePreview && (
                        <CardContent>
                             <div className="relative w-full" style={{paddingTop: '129.4%'}}> {/* A4 Aspect Ratio */}
                                <Image src={mainImagePreview} alt={form.name} fill className="rounded-lg object-contain border bg-white" />
                            </div>
                        </CardContent>
                    )}
                </Card>

                {form.files && form.files.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Fichiers joints</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                        {form.files.map(file => (
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

export default function PublicFormPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
            <PageContent />
        </Suspense>
    )
}
