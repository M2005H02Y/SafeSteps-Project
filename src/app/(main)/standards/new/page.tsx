
"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addStandard, FileAttachment } from '@/lib/data';

export default function NewStandardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim()) {
        toast({
            title: "Erreur de validation",
            description: "Le nom et la catégorie de la norme sont obligatoires.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);

    try {
      const mainImage = files.find(f => f.type === 'image');
      const otherFiles = files.filter(f => f.url !== mainImage?.url);

      const success = await addStandard({ 
        name, 
        category, 
        version, 
        description,
        image: mainImage?.url,
        files: otherFiles 
      });

      if (success) {
        toast({
          title: "Norme créée",
          description: "La nouvelle norme a été enregistrée avec succès.",
        });
        router.push('/standards');
      } else {
        throw new Error("API call failed");
      }
    } catch (error) {
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible de sauvegarder la norme. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer une nouvelle norme">
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
              Enregistrer le nouveau standard
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
                <Input id="std-name" placeholder="ex: ISO 9001:2015" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="std-category">Catégorie</Label>
                <Input id="std-category" placeholder="ex: Management de la qualité" required value={category} onChange={e => setCategory(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-version">Version</Label>
              <Input id="std-version" placeholder="ex: 2015" value={version} onChange={e => setVersion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-desc">Description</Label>
              <Textarea id="std-desc" placeholder="Décrivez la norme." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pièces jointes</CardTitle>
            <CardDescription>Téléchargez la documentation, des images ou des fichiers pertinents. La première image sera utilisée comme image principale.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUploadComplete={setFiles} />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
