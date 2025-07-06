
"use client";

import { useRouter, useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFormById, updateForm, Form, TableData } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [name, setName] = useState('');
  const [tableData, setTableData] = useState<TableData | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const formData = getFormById(id);
      if (formData) {
        setForm(formData);
        setName(formData.name);
        setTableData(formData.tableData);
      }
      setIsLoading(false);
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
      const success = updateForm(id, { name, tableData });

      if (success) {
        toast({
          title: "Formulaire mis à jour",
          description: "Le formulaire a été enregistré avec succès.",
        });
        router.push('/forms');
        router.refresh();
      } else {
         throw new Error("Local storage save failed");
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
    return <div className="p-6"><Skeleton className="w-full h-96" /></div>;
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

        <EnhancedDynamicTable initialData={tableData} onDataChange={setTableData} />
      </main>
    </form>
  );
}
