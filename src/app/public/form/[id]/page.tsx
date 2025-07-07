'use client';

import { useSearchParams, notFound } from 'next/navigation';
import { Form } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ImprovedFillableTable from '@/components/improved-fillable-table';

// Copied from main page for reuse, can be extracted to its own component later if needed.
function ReadOnlyTable({ tableData }: { tableData: Form['tableData'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p>Ce formulaire n'a pas de tableau configuré.</p>
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
        <div className="overflow-auto rounded-md border bg-slate-100 p-2 shadow-inner">
            <table className="w-full h-full border-collapse min-w-[40rem]">
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

export default function PublicFormPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(dataParam);
        const parsedData: Form = JSON.parse(decodedData);
        setForm(parsedData);
      } catch (error) {
        console.error("Failed to parse form data from URL", error);
        setForm(null);
      }
    }
  }, [searchParams]);

  if (!form) {
    // Show a loading/error state or redirect. For now, notFound is fine if data is invalid.
    return notFound();
  }

  const imageFiles = form.files?.filter(f => f.type === 'image') || [];
  const otherFiles = form.files?.filter(f => f.type !== 'image') || [];

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <Button onClick={() => setIsFillModalOpen(true)}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                Remplir et Exporter
            </Button>
        </div>

        {imageFiles.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Images jointes</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageFiles.map((file) => (
                        <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border hover:opacity-90 transition-opacity">
                                <Image src={file.url} alt={file.name} fill className="object-cover" data-ai-hint="form image" />
                            </div>
                        </a>
                    ))}
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Aperçu du formulaire</CardTitle>
                <CardDescription>Ceci est la structure du formulaire. Cliquez sur "Remplir et Exporter" pour interagir.</CardDescription>
            </CardHeader>
            <CardContent>
                <ReadOnlyTable tableData={form.tableData}/>
            </CardContent>
        </Card>

        {otherFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{imageFiles.length > 0 ? 'Autres fichiers joints' : 'Fichiers joints'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {otherFiles.map(file => (
                    <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border bg-slate-100 hover:bg-slate-200 transition-colors">
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

    {isFillModalOpen && form.tableData && (
        <ImprovedFillableTable
            formName={form.name}
            tableData={form.tableData}
            isOpen={isFillModalOpen}
            onClose={() => setIsFillModalOpen(false)}
        />
    )}
    </>
  );
}
