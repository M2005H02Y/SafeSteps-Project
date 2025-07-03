import { notFound } from 'next/navigation';
import { getFormById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { File, FileText as FileTextIcon } from 'lucide-react';

export default function PublicFormPage({ params }: { params: { id: string } }) {
    const form = getFormById(params.id);

    if (!form) {
        notFound();
    }
  
    const pdfFile = form.files?.find(f => f.type === 'pdf');

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <main className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">{form.name}</CardTitle>
                        <CardDescription>Type: <Badge variant="secondary">{form.type}</Badge> | Dernière mise à jour: {form.lastUpdated}</CardDescription>
                    </CardHeader>
                </Card>

                {pdfFile ? (
                <Card>
                    <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                    <CardContent>
                        <iframe src={pdfFile.url} className="w-full h-[1000px] border rounded-md" title={pdfFile.name}></iframe>
                    </CardContent>
                </Card>
                ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                        <p>Aucun aperçu disponible pour ce formulaire.</p>
                        <p className="text-sm">Téléchargez un PDF pour le voir ici.</p>
                    </div>
                </Card>
                )}

                {form.files && form.files.length > 0 && (
                <Card>
                    <CardHeader>
                    <CardTitle>Fichiers joints</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                    {form.files.map(file => (
                        <Link key={file.name} href={file.url} download={file.name} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                {file.type === 'pdf' ? <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" /> : <File className="h-6 w-6 text-green-500 flex-shrink-0" />}
                                <span className="text-md font-medium truncate">{file.name}</span>
                            </div>
                        </Link>
                    ))}
                    </CardContent>
                </Card>
                )}
            </main>
        </div>
    );
}
