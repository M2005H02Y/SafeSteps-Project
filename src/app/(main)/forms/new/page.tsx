
"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addForm, TableData, FileAttachment } from '@/lib/data';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';
import FileUpload from '@/components/file-upload';
import { Switch } from '@/components/ui/switch';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isTableEnabled, setIsTableEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableRef = useRef<{ getTableData: () => TableData }>(null);

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
      const tableData = isTableEnabled ? tableRef.current?.getTableData() : undefined;
      const success = await addForm({ name, table_data: tableData, files });

      if (success) {
        toast({
          title: "Formulaire créé",
          description: "Le nouveau formulaire a été enregistré avec succès.",
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer un nouveau formulaire">
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
              Enregistrer le formulaire
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du formulaire</CardTitle>
          </CardHeader>
          <CardContent>
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
                <CardDescription>Activez pour ajouter et configurer un tableau pour ce formulaire.</CardDescription>
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
              <EnhancedDynamicTable ref={tableRef} />
            </CardContent>
          )}
        </Card>

      </main>
    </form>
  );
}
