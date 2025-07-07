
"use client";

import { useRouter, useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getStandardById, updateStandard, FileAttachment, Standard } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditStandardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [standard, setStandard] = useState<Standard | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchStandard = async () => {
        setIsLoading(true);
        const sData = await getStandardById(id);
        if (sData) {
          setStandard(sData);
          setName(sData.name);
          setCategory(sData.category);
          setVersion(sData.version || '');
          setDescription(sData.description || '');
          const allFiles = [];
          if(sData.image){
              allFiles.push({ name: 'Image principale', url: sData.image, type: 'image' as const});
          }
          if(sData.files){
              allFiles.push(...sData.files);
          }
          setFiles(allFiles);
        }
        setIsLoading(false);
      }
      fetchStandard();
    }
  }, [id]);

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

      const success = await updateStandard(id, { 
        name, 
        category, 
        version, 
        description,
        image: mainImage?.url,
        files: otherFiles 
      });

      if (success) {
        toast({
          title: "Norme mise à jour",
          description: "La norme a été enregistrée avec succès.",
        });
        router.push('/standards');
        router.refresh();
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
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!standard) {
    return notFound();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title={`Modifier: ${standard.name}`}>
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
            <CardTitle>Détails de la norme</CardTitle>
            <CardDescription>Modifiez les détails de la norme opérationnelle.</CardDescription>
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
            <FileUpload initialFiles={files} onUploadComplete={setFiles} />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
