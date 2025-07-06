
"use client";

import { notFound, useRouter, useParams } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, FileText as FileTextIcon, Columns } from 'lucide-react';
import QRCode from '@/components/qr-code';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ImprovedFillableTable from '@/components/improved-fillable-table';

function ReadOnlyTable({ tableData }: { tableData: Form['tableData'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p>Ce formulaire n'a pas encore de structure de tableau.</p>
                <p className="text-sm">Modifiez le formulaire pour en créer une.</p>
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
                className="border border-slate-200 p-2 align-top text-sm"
            >
                {cell.content}
            </td>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {[...Array(tableData.cols)].map((_, c) => (
                            <th key={c} className="border border-slate-200 p-2 bg-slate-50 text-sm font-medium text-left">
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

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const f = getFormById(id);
      if(f) {
          setForm(f);
      }
      setLoading(false);
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
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    notFound();
  }

  return (
    <>
    <div className="flex flex-col h-full">
      <PageHeader title={form.name}>
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
          <Button onClick={() => setIsFillModalOpen(true)}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            Remplir le formulaire
          </Button>
        </div>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Aperçu du tableau</CardTitle>
                    <CardDescription>Ceci est la structure du formulaire que vous avez créée.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReadOnlyTable tableData={form.tableData}/>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
            <QRCode type="form" id={id} data={form} />
          </div>
        </div>
      </main>
    </div>
    
    {isFillModalOpen && (
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
