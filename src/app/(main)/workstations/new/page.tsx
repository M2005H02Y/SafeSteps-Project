"use client";

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DynamicTable from '@/components/dynamic-table';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addWorkstation } from '@/lib/data';
import { useState } from 'react';

export default function NewWorkstationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        toast({
            title: "Erreur de validation",
            description: "Le nom du poste de travail est obligatoire.",
            variant: "destructive",
        });
        return;
    }
    addWorkstation({ name, description });
    toast({
      title: "Poste de travail créé",
      description: "Le nouveau poste de travail a été enregistré avec succès.",
    });
    router.push('/workstations');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer un nouveau poste de travail">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Annuler
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le poste de travail
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>Fournissez un nom et une description pour le nouveau poste de travail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Nom du poste de travail</Label>
              <Input id="ws-name" placeholder="ex: Ligne d'assemblage Alpha" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-desc">Description</Label>
              <Textarea id="ws-desc" placeholder="Décrivez le but de ce poste de travail." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tableau des procédures</CardTitle>
            <CardDescription>Ajoutez des étapes, des tâches ou toute autre donnée structurée dans un format de tableau.</CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pièces jointes</CardTitle>
            <CardDescription>Téléchargez des images, des PDF ou des feuilles de calcul pertinents.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
