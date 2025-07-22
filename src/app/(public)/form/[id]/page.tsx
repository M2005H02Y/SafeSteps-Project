
'use client';

import { notFound, useParams } from 'next/navigation';
import { getFormById, Form, logAnalyticsEvent, ContentBlock } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, Download, ImageIcon, FileSpreadsheet, ExternalLink, Table } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FillableFormModal from '@/components/fillable-form-modal';
import { Skeleton } from '@/components/ui/skeleton';
import OcpLogo from '@/app/ocplogo.png';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function ReadOnlyTable({ tableData }: { tableData: Form['table_data'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return null;
    }
    
    const getCellKey = (r: number, c: number) => `${r}-${c}`;

    const renderCell = (r: number, c: number) => {
        const key = getCellKey(r, c);
        const cell = tableData.data[key];
        if (cell?.merged) return null;

        const CellComponent = cell?.isHeader ? 'th' : 'td';
        const cellStyle = cell?.isHeader 
            ? "border border-slate-400 p-2 bg-slate-200 text-sm font-semibold text-left"
            : "border border-slate-300 p-2 text-sm bg-white";

        return (
            <CellComponent
                key={key}
                colSpan={cell?.colspan}
                rowSpan={cell?.rowspan}
                className={cellStyle}
            >
                <div>{cell?.content}</div>
            </CellComponent>
        );
    }

    // Determine the number of header rows
    let headerRows = 0;
    if (tableData && tableData.rows > 0 && tableData.cols > 0) {
      let isHeaderRow = true;
      for (let r = 0; r < tableData.rows && isHeaderRow; r++) {
        let rowIsAllHeaders = true;
        for (let c = 0; c < tableData.cols; c++) {
          const key = getCellKey(r, c);
          if (!tableData.data[key]?.merged && !tableData.data[key]?.isHeader) {
            rowIsAllHeaders = false;
            break;
          }
        }
        if (rowIsAllHeaders) {
          headerRows++;
        } else {
          isHeaderRow = false;
        }
      }
    }


    return (
        <div className="overflow-auto rounded-md border bg-slate-100 p-2">
            <table className="w-full border-collapse">
                {headerRows > 0 && (
                    <thead>
                        {[...Array(headerRows)].map((_, r) => (
                            <tr key={`hr-${r}`}>
                                {[...Array(tableData.cols)].map((_, c) => renderCell(r, c))}
                            </tr>
                        ))}
                    </thead>
                )}
                <tbody>
                    {[...Array(tableData.rows - headerRows)].map((_, r_offset) => {
                       const r = r_offset + headerRows;
                       return (
                           <tr key={`br-${r}`}>
                                {[...Array(tableData.cols)].map((_, c) => renderCell(r,c))}
                           </tr>
                       )
                    })}
                </tbody>
            </table>
        </div>
    );
}

function ParagraphPreview({ template }: { template: string | null | undefined }) {
  if (!template) return null;

  const previewHtml = template.replace(/\[([^\]]+)\]/g, 
    '<span class="font-semibold text-primary bg-primary/10 p-1 rounded-sm mx-1">$&</span>'
  );

  return (
    <div 
      className="p-4 border rounded-md bg-background/50 text-sm prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
  );
}


function PublicPageSkeleton() {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
            <main className="w-full max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default function FormPublicPage() {
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
                    if (f) {
                        setForm(f);
                        logAnalyticsEvent({
                            event_type: 'consultation',
                            target_type: 'form',
                            target_id: f.id,
                        });
                    }
                } catch(e) {
                    console.error("Failed to fetch form", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchForm();
        }
    }, [id]);

    if (loading) {
        return <PublicPageSkeleton />;
    }

    if (!form) {
        notFound();
    }
    
    const imageFiles = form.files?.filter(f => f.type === 'image') || [];
    const otherFiles = form.files?.filter(f => f.type !== 'image') || [];
    const canBeFilled = form.content_blocks && form.content_blocks.length > 0;
    
    const metadataItems = [
        { label: "Référence", value: form.reference },
        { label: "Édition", value: form.edition },
        { label: "Date d'émission", value: form.issue_date ? format(new Date(form.issue_date), "dd MMMM yyyy", { locale: fr }) : null },
        { label: "Pages", value: form.page_count },
    ].filter(item => item.value);

    return (
        <>
            <div className="flex flex-col items-center min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
                <main className="w-full max-w-4xl mx-auto space-y-8">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg p-2">
                            <Image src={OcpLogo} alt="SafeSteps Logo" width={96} height={96} className="h-full w-full object-contain rounded-full" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900">SafeSteps</h1>
                        <p className="text-muted-foreground mt-1">Votre sécurité, notre priorité.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{form.name}</CardTitle>
                                    <div className="text-sm text-muted-foreground pt-2 flex flex-wrap gap-x-4 gap-y-1">
                                        {metadataItems.map(item => (
                                            <div key={item.label}>
                                                <span className="font-semibold">{item.label}:</span> {item.value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 {canBeFilled && (
                                    <Button onClick={() => setIsFillModalOpen(true)} className="w-full sm:w-auto">
                                        <FileTextIcon className="mr-2 h-4 w-4" />
                                        Remplir le formulaire
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {canBeFilled && (
                                <div className="bg-slate-100 rounded-lg p-4 space-y-4">
                                    <p className="text-center text-muted-foreground text-sm">
                                        Bienvenue sur SafeSteps. Remplissez ce formulaire en cliquant sur le bouton ci-dessus.
                                    </p>
                                    {form.content_blocks?.map(block => (
                                        <div key={block.id}>
                                            {block.type === 'paragraph' && <ParagraphPreview template={block.template} />}
                                            {block.type === 'table' && <ReadOnlyTable tableData={block.data}/>}
                                        </div>
                                    ))}
                                </div>
                            )}

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
                        </CardContent>
                    </Card>
                </main>
            </div>
             {isFillModalOpen && canBeFilled && (
                <FillableFormModal
                    form={form}
                    isOpen={isFillModalOpen}
                    onClose={() => setIsFillModalOpen(false)}
                />
            )}
        </>
    );
}
