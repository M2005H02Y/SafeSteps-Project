
"use client";

import { notFound, useRouter, useParams } from 'next/navigation';
import { getFormById, Form, ContentBlock } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, FileText as FileTextIcon, ExternalLink, File as FileIcon, ImageIcon, FileSpreadsheet, Table } from 'lucide-react';
import QRCode from '@/components/qr-code';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import FillableFormModal from '@/components/fillable-form-modal';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function ReadOnlyTable({ tableData }: { tableData: Form['table_data'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return null; // Don't render anything if no table data
    }
    
    const getCellKey = (r: number, c: number) => `${r}-${c}`;

    const renderCell = (r: number, c: number) => {
        const key = getCellKey(r, c);
        const cell = tableData.data[key];
        if (cell?.merged) return null;

        const CellComponent = cell?.isHeader ? 'th' : 'td';
        const cellStyle = cell?.isHeader
            ? "border border-slate-300 p-2 bg-slate-100 text-sm font-semibold text-left"
            : "border border-slate-200 p-2 text-sm";

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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Table className="h-5 w-5" /> Bloc Tableau</CardTitle>
                <CardDescription>Ceci est la structure du formulaire que vous avez créée.</CardDescription>
            </CardHeader>
            <CardContent>
                <div 
                    className="overflow-auto rounded-md border p-2 resize bg-background shadow-sm"
                    style={{ minHeight: '250px' }}
                >
                    <table className="w-full h-full border-collapse min-w-[40rem]">
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
            </CardContent>
        </Card>
    );
}

function ParagraphPreview({ template }: { template: string | null | undefined }) {
  if (!template) return null;

  // Replace dynamic fields like [field] with a styled span for preview
  const previewHtml = template.replace(/\[([^\]]+)\]/g, 
    '<span class="font-semibold text-primary bg-primary/10 p-1 rounded-sm mx-1">$&</span>'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileTextIcon className="h-5 w-5" /> Bloc Paragraphe</CardTitle>
        <CardDescription>Ceci est le modèle de texte que les opérateurs rempliront.</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="p-4 border rounded-md bg-background/50 text-sm prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </CardContent>
    </Card>
  );
}


function FormMetadata({form}: {form: Form}) {
    const metadataItems = [
        { label: "Référence", value: form.reference },
        { label: "Édition", value: form.edition },
        { label: "Date d'émission", value: form.issue_date ? format(new Date(form.issue_date + 'T00:00:00Z'), "dd/MM/yyyy") : null },
        { label: "Nb. de pages", value: form.page_count },
    ].filter(item => item.value);

    if (metadataItems.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spécification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {metadataItems.map(item => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default function FormDetailPage() {
  const router = useRouter();
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
      <div className="flex flex-col h-full p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] w-full" />
             <Skeleton className="h-[150px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }

  const imageFiles = form.files?.filter(f => f.type === 'image') || [];
  const otherFiles = form.files?.filter(f => f.type !== 'image') || [];
  const canBeFilled = form.content_blocks && form.content_blocks.length > 0;

  return (
    <>
    <div className="flex flex-col h-full">
      <PageHeader title={form.name} description={`Mis à jour le ${new Date(form.last_updated).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/forms')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button asChild variant="outline">
            <Link href={`/forms/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          {canBeFilled && (
            <Button onClick={() => setIsFillModalOpen(true)}>
              <FileTextIcon className="mr-2 h-4 w-4" />
              Remplir le formulaire
            </Button>
          )}
        </div>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
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
            <FormMetadata form={form} />
            {form.content_blocks?.map(block => {
              if (block.type === 'table') {
                return <ReadOnlyTable key={block.id} tableData={block.data}/>
              }
              if (block.type === 'paragraph') {
                return <ParagraphPreview key={block.id} template={block.template} />
              }
              return null;
            })}
            
            { !canBeFilled && (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Ce formulaire n'a pas de contenu interactif. Modifiez-le pour en ajouter.
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-6">
            <QRCode type="form" id={id} />
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
