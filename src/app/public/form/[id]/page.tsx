"use client";

import { notFound, useParams } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText as FileTextIcon, ExternalLink, File as FileIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ImprovedFillableTable from '@/components/improved-fillable-table';

export default function PublicFormPage() {
    const params = useParams();
    const id = params.id as string;
    
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFillModalOpen, setIsFillModalOpen] = useState(false);

    useEffect(() => {
    if (id) {
        const fetchForm = async () => {
        setLoading(true);
        const f = await getFormById(id);
        if(f) {
            setForm(f);
        }
        setLoading(false);
        }
        fetchForm();
    }
    }, [id]);

    if (loading) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        </div>
    );
    }

    if (!form) {
    notFound();
    }

    const imageFiles = form.files?.filter(f => f.type === 'image') || [];
    const otherFiles = form.files?.filter(f => f.type !== 'image') || [];

    return (
    <>
    <div className="max-w-4xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription>Vous pouvez remplir et télécharger ce formulaire.</CardDescription>
            </CardHeader>
            <CardContent>
                {form.table_data ? (
                    <Button onClick={() => setIsFillModalOpen(true)} className="w-full">
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        Commencer à remplir le formulaire
                    </Button>
                ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">Ce formulaire n'a pas de tableau à remplir.</p>
                )}
            </CardContent>
        </Card>

        {imageFiles.length > 0 && (
            <Card>
                <CardHeader><CardTitle>Images jointes</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {imageFiles.map((file) => (
                        <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border hover:opacity-90 transition-opacity">
                            <Image 
                                src={file.url} 
                                alt={file.name} 
                                fill
                                className="object-cover"
                                data-ai-hint="form image" 
                            />
                        </div>
                        </a>
                    ))}
                </CardContent>
            </Card>
        )}

        {otherFiles.length > 0 && (
            <Card>
            <CardHeader><CardTitle>Autres fichiers joints</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                {otherFiles.map(file => (
                <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-2"/>
                </a>
                ))}
            </CardContent>
            </Card>
        )}
    </div>
    
    {isFillModalOpen && form.table_data && (
        <ImprovedFillableTable
            formName={form.name}
            tableData={form.table_data}
            isOpen={isFillModalOpen}
            onClose={() => setIsFillModalOpen(false)}
        />
    )}
    </>
    );
}
