'use client';

import { Suspense } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { b64_to_utf8 } from '@/lib/utils';
import { Form, FileAttachment, TableData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, Image as ImageIcon, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type PublicForm = Omit<Form, 'id' | 'lastUpdated'>;


function ReadOnlyTable({ tableData }: { tableData: TableData | undefined }) {
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
                className="border border-slate-300 p-2 text-sm align-top"
            >
                <div>{cell.content}</div>
                {cell.image && (
                     <div className="relative mt-2 w-full aspect-square max-w-[150px]">
                        <Image 
                            src={cell.image} 
                            alt="Image de cellule" 
                            fill
                            className="object-contain rounded"
                        />
                     </div>
                )}
            </td>
        );
    }

    return (
        <div className="overflow-auto rounded-md border bg-background">
            <table className="w-full border-collapse min-w-[40rem]">
                <thead>
                    <tr>
                        {[...Array(tableData.cols)].map((_, c) => (
                            <th key={c} className="border border-slate-300 p-2 bg-slate-100 text-sm font-medium text-left">
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

function FormPublicPageContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  if (!dataParam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Données non valides</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Les données du formulaire sont manquantes dans l'URL.</p>
        </CardContent>
      </Card>
    );
  }

  let form: PublicForm;
  try {
    const decodedData = b64_to_utf8(dataParam);
    form = JSON.parse(decodedData);
  } catch (error) {
    console.error("Failed to parse form data from QR code:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur de décodage</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Impossible de lire les données du code QR. Il est peut-être corrompu ou obsolète.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!form || !form.name) {
    notFound();
  }

  const imageFiles = form.files?.filter(f => f.type === 'image') || [];
  const otherFiles = form.files?.filter(f => f.type !== 'image') || [];


  return (
    <div className="space-y-6">
      <header className="space-y-2">
         <div className="flex items-center gap-4">
            <ClipboardList className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-slate-800">{form.name}</h1>
                <p className="text-lg text-muted-foreground">Vous pouvez remplir ce formulaire ou l'imprimer.</p>
            </div>
        </div>
      </header>
      
      {imageFiles.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Images jointes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <CardTitle>Structure du formulaire</CardTitle>
              <CardDescription>Ceci est une prévisualisation de la structure du formulaire.</CardDescription>
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
            {otherFiles.map((file: FileAttachment) => (
              <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                  {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                  {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                  {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Download className="h-5 w-5 text-muted-foreground ml-2"/>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PageSkeleton() {
    return (
         <div className="space-y-6">
            <header className="space-y-2">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-6 w-80" />
                    </div>
                </div>
            </header>
            <Card>
                <CardHeader>
                     <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
         </div>
    )
}

export default function PublicFormPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <FormPublicPageContent />
        </Suspense>
    )
}
