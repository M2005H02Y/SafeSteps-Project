
"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addForm, TableData } from '@/lib/data';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [tableData, setTableData] = useState<TableData>({ rows: 3, cols: 3, data: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const success = addForm({ name, tableData });

      if (success) {
        toast({
          title: "Formulaire créé",
          description: "Le nouveau formulaire a été enregistré avec succès.",
        });
        router.push('/forms');
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
        
        <EnhancedDynamicTable onDataChange={setTableData} />

      </main>
    </form>
  );
}
