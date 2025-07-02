"use client";

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NewStandardPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Norme créée",
      description: "La nouvelle norme a été enregistrée avec succès.",
    });
    setTimeout(() => router.push('/standards'), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer une nouvelle norme">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Annuler
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer la norme
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de la norme</CardTitle>
            <CardDescription>Fournissez les détails de la nouvelle norme opérationnelle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="std-name">Nom de la norme</Label>
                <Input id="std-name" placeholder="ex: ISO 9001:2015" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="std-category">Catégorie</Label>
                <Input id="std-category" placeholder="ex: Management de la qualité" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-version">Version</Label>
              <Input id="std-version" placeholder="ex: 2015" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-desc">Description</Label>
              <Textarea id="std-desc" placeholder="Décrivez la norme." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pièces jointes</CardTitle>
            <CardDescription>Téléchargez la documentation pertinente ou les fichiers de résumé.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
