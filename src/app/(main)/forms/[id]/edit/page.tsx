
"use client";

import { useRouter, useParams, notFound } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFormById, updateForm, Form, TableData, FileAttachment } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';
import FileUpload from '@/components/file-upload';
import { Switch } from '@/components/ui/switch';

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [tableData, setTableData] = useState<TableData | undefined>(undefined);
  const [isTableEnabled, setIsTableEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef<{ getTableData: () => TableData }>(null);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        setIsLoading(true);
        const formData = await getFormById(id);
        if (formData) {
          setForm(formData);
          setName(formData.name);
          setFiles(formData.files || []);

          if (formData.table_data) {
            setTableData(formData.table_data);
            setIsTableEnabled(true);
          } else {
            setIsTableEnabled(false);
          }
        }
        setIsLoading(false);
      }
      fetchForm();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim()) {
        toast({
            title: "Erreur de validation",
            description: "Le nom du formulaire est obligatoire.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalTableData = isTableEnabled ? tableRef.current?.getTableData() : undefined;
      const success = await updateForm(id, { name, table_data: finalTableData, files });

      if (success) {
        toast({
          title: "Formulaire mis à jour",
          description: "Le formulaire a été enregistré avec succès.",
        });
        router.push('/forms');
      } else {
         throw new Error("API call failed");
      }
    } catch (error) {
       toast({
        title: "Erreur d'enregistrement",
        description: "Impossible de sauvegarder le formulaire. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Chargement...">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </PageHeader>
        <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-10 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return notFound();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title={`Modifier: ${form.name}`}>
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enregistrer les modifications
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du formulaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Nom du formulaire</Label>
                <Input id="form-name" placeholder="ex: Check-list quotidienne de l'équipement" required value={name} onChange={e => setName(e.target.value)} />
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pièces jointes</CardTitle>
            <CardDescription>Ajoutez des fichiers pertinents au formulaire.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload initialFiles={files} onUploadComplete={setFiles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center justify-between">
              <div>
                <CardTitle>Structure du tableau (Optionnel)</CardTitle>
                <CardDescription>Activez pour ajouter ou modifier le tableau de ce formulaire.</CardDescription>
              </div>
              <Switch
                id="table-toggle"
                checked={isTableEnabled}
                onCheckedChange={setIsTableEnabled}
                aria-label="Activer le tableau"
              />
            </div>
          </CardHeader>
          {isTableEnabled && (
            <CardContent>
              <EnhancedDynamicTable
                ref={tableRef}
                initialData={tableData}
              />
            </CardContent>
          )}
        </Card>

      </main>
    </form>
  );
}
