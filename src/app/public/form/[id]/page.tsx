
"use client";

import { notFound, useParams } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText as FileTextIcon, ExternalLink, File as FileIcon, ImageIcon, FileSpreadsheet, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ImprovedFillableTable from '@/components/improved-fillable-table';
import Image from 'next/image';

function ReadOnlyTable({ tableData }: { tableData: Form['table_data'] }) {
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
        <div 
            className="overflow-auto rounded-md border p-2 resize bg-slate-100 shadow-sm"
        >
            <table className="w-full border-collapse min-w-[40rem]">
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
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        setLoading(true);
        try {
          const f = await getFormById(id);
          setForm(f || null);
        } catch (error) {
          console.error("Failed to fetch form:", error);
          setForm(null);
        } finally {
          setLoading(false);
        }
      }
      fetchForm();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription>Mis à jour le {new Date(form.last_updated).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsFillModalOpen(true)} className="w-full">
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    Remplir et Exporter le formulaire
                </Button>
            </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
             {imageFiles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Images jointes</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
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
             <Card>
                <CardHeader>
                    <CardTitle>Aperçu du tableau</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReadOnlyTable tableData={form.table_data}/>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             {otherFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{imageFiles.length > 0 ? 'Autres fichiers joints' : 'Fichiers joints'}</CardTitle>
                </CardHeader>
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
        </div>
      </main>
    
      {isFillModalOpen && (
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
