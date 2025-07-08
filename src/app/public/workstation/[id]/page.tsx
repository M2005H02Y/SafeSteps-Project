import { notFound } from 'next/navigation';
import { getWorkstationById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function PublicWorkstationPage({ params }: { params: { id: string } }) {
    const workstation = await getWorkstationById(params.id);

    if (!workstation) {
    notFound();
    }

    return (
    <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words">{workstation.name}</CardTitle>
                    <CardDescription className="break-words pt-2">
                    <Badge variant="secondary" className="mr-2">{workstation.type}</Badge>
                    {workstation.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {workstation.image && (
                        <div className="relative aspect-video w-full">
                            <Image src={workstation.image} alt={workstation.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="assembly line" />
                        </div>
                    )}
                </CardContent>
            </Card>

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
        </div>
    </div>
    );
}
