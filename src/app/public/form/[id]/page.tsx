"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Form } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText as FileTextIcon, Loader2 } from 'lucide-react';
import ImprovedFillableTable from '@/components/improved-fillable-table';
import { Skeleton } from '@/components/ui/skeleton';

function PublicFormPageContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const id = params.id;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    let formData: Form | null = null;

    if (dataParam) {
      try {
        const decodedData = b64_to_utf8(decodeURIComponent(dataParam));
        if (decodedData) {
          formData = JSON.parse(decodedData) as Form;
        }
      } catch (error) {
        console.error("Failed to parse form data from URL", error);
      }
    }
    
    if (formData) {
      setForm(formData);
    }
    setLoading(false);
  }, [id, searchParams]);

  if (loading) {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-center mt-4">
                <Skeleton className="h-12 w-48" />
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!form) {
    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive">Données du formulaire non valides</h1>
            <p className="text-muted-foreground mt-2">Impossible de charger les données du formulaire à partir du code QR. Veuillez réessayer de le scanner.</p>
        </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-3xl font-bold">{form.name}</h1>
        <p className="text-muted-foreground">Formulaire public. Cliquez sur le bouton ci-dessous pour remplir et exporter.</p>
        
        <div className="flex justify-center mt-4">
            <Button size="lg" onClick={() => setIsFillModalOpen(true)}>
                <FileTextIcon className="mr-2 h-5 w-5" />
                Remplir et Exporter
            </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aperçu du Tableau</CardTitle>
            <CardDescription>Ceci est une représentation statique de la structure du formulaire.</CardDescription>
          </CardHeader>
          <CardContent>
             {form.tableData ? (
                 <div className="text-center text-muted-foreground p-4 border rounded-md bg-slate-100">
                    La structure du tableau s'affichera dans le formulaire interactif.
                 </div>
             ) : (
                <div className="text-center text-muted-foreground p-4 border rounded-md bg-slate-100">
                    Ce formulaire ne contient pas de tableau.
                </div>
             )}
          </CardContent>
        </Card>
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

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

export default function PublicFormPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PublicFormPageContent params={params} />
        </Suspense>
    );
}
