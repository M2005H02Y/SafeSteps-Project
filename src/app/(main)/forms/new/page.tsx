"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUpload, { UploadedFile } from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addForm } from '@/lib/data';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim() || !type.trim()) {
        toast({
            title: "Erreur de validation",
            description: "Le nom et le type du formulaire sont obligatoires.",
            variant: "destructive",
        });
        return;
    }

    const success = addForm({ name, type, files });

    if (success) {
      toast({
        title: "Formulaire créé",
        description: "Le nouveau formulaire a été enregistré avec succès.",
      });
      router.push('/forms');
    } else {
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible de sauvegarder. Les fichiers sont peut-être trop volumineux pour le stockage local du navigateur.",
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer un nouveau formulaire">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Annuler
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le formulaire
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du formulaire</CardTitle>
            <CardDescription>Fournissez les détails du nouveau formulaire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Nom du formulaire</Label>
                <Input id="form-name" placeholder="ex: Check-list quotidienne de l'équipement" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-type">Type de formulaire</Label>
                <Input id="form-type" placeholder="ex: Sécurité" required value={type} onChange={e => setType(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Télécharger le fichier du formulaire</CardTitle>
            <CardDescription>Téléchargez le fichier principal pour ce formulaire (par ex., PDF, Excel). Le premier PDF téléchargé sera utilisé pour l'aperçu.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onFilesChange={setFiles}/>
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
