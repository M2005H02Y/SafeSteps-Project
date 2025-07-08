import { notFound } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, ImageIcon, FileSpreadsheet, ExternalLink } from 'lucide-react';

function ReadOnlyTable({ tableData }: { tableData: Form['table_data'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p>Ce formulaire n'a pas de tableau de données.</p>
            </div>
        );
    }
    
    const getCellKey = (r: number, c: number) => `${r}-${c}`;

    const renderCell = (r: number, c: number) => {
        const key = getCellKey(r,c);
        const cell = tableData.data[key] || { content: '' };
        if (cell.merged) return null;

        return (
            <td
                key={key}
                colSpan={cell.colspan}
                rowSpan={cell.rowspan}
                className="border border-slate-300 p-2 text-sm bg-white"
            >
                <div>{cell.content}</div>
            </td>
        );
    }

    return (
        <div className="overflow-auto rounded-md border bg-slate-100 p-2">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {[...Array(tableData.cols)].map((_, c) => (
                            <th key={c} className="border border-slate-300 p-2 bg-slate-200 text-sm font-medium text-left">
                                {tableData.headers?.[c] || `Colonne ${c + 1}`}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(tableData.rows)].map((_, r) => (
                        <tr key={r}>
                            {[...Array(tableData.cols)].map((_, c) => renderCell(r,c))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

async function FormPublicPage({ params }: { params: { id: string } }) {
    const form = await getFormById(params.id);

    if (!form) {
        notFound();
    }
    
    const imageFiles = form.files?.filter(f => f.type === 'image') || [];
    const otherFiles = form.files?.filter(f => f.type !== 'image') || [];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                 <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                        <img src="/logo.jpg" alt="SafeSteps Logo" className="h-16 w-16 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">SafeSteps</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{form.name}</CardTitle>
                        <CardDescription>
                            Mis à jour le {new Date(form.last_updated).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {imageFiles.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Images jointes</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                </div>
                            </div>
                        )}

                        {otherFiles.length > 0 && (
                             <div>
                                <h3 className="text-lg font-semibold mb-2">Autres fichiers joints</h3>
                                <div className="space-y-2">
                                {otherFiles.map(file => (
                                    <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                                            {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                            {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                                            <span className="text-sm font-medium truncate">{file.name}</span>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-2"/>
                                    </a>
                                ))}
                                </div>
                            </div>
                        )}

                        {form.table_data && (
                           <div>
                                <h3 className="text-lg font-semibold mb-2">Structure du formulaire</h3>
                                <ReadOnlyTable tableData={form.table_data}/>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default FormPublicPage;
