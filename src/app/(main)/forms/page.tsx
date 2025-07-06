
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Search,
  Trash2,
  FileText as FileTextIcon,
  Edit,
  Columns
} from 'lucide-react';
import { getForms, deleteForm, Form } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

function PageSkeleton() {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Formulaires" description="Gestion des formulaires configurables">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                 <Card>
                    <CardContent className="p-4">
                        <Skeleton className="h-9 w-full max-w-sm" />
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
      </div>
    );
}

function FormsPageContent() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshForms = () => {
    const freshData = getForms();
    setForms(freshData);
  };

  useEffect(() => {
    refreshForms();
  }, []);

  const filteredForms = useMemo(() => {
    return forms.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [forms, searchTerm]);

  const openDeleteDialog = (id: string) => {
    setFormToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (formToDelete) {
      const success = deleteForm(formToDelete);
      if (success) {
        toast({ title: "Formulaire supprimé" });
        refreshForms();
      } else {
        toast({ title: "Erreur", description: "La suppression du formulaire a échoué.", variant: "destructive" });
      }
      setFormToDelete(null);
    }
  };
  
  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Formulaires" description="Gestion des formulaires configurables">
            <Button asChild className="gradient-primary">
                <Link href="/forms/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouveau Formulaire
                </Link>
            </Button>
        </PageHeader>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Card className="mb-6 glass-effect">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher un formulaire..." 
                    className="pl-9 bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {filteredForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredForms.map((form) => (
                    <Link href={`/forms/${form.id}`} key={form.id} className="block hover:-translate-y-1 transition-transform duration-200">
                        <Card className="h-full flex flex-col glass-effect hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="truncate" title={form.name}>{form.name}</CardTitle>
                                <CardDescription>
                                     Mis à jour le {new Date(form.lastUpdated).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Columns className="h-4 w-4" />
                                    <span>{form.tableData?.rows || 0} lignes, {form.tableData?.cols || 0} colonnes</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-600 hover:bg-slate-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/forms/${form.id}/edit`);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Modifier</span>
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openDeleteDialog(form.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Supprimer</span>
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                    <FileTextIcon className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold">Aucun formulaire trouvé</h3>
                    <p className="mt-2">Essayez d'ajuster votre recherche ou <Link href="/forms/new" className="text-primary underline">créez un nouveau formulaire</Link>.</p>
                </div>
            )}
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e)?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Elle supprimera définitivement le formulaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continuer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function FormsPage() {
    return (
      <Suspense fallback={<PageSkeleton/>}>
        <FormsPageContent />
      </Suspense>
    )
  }
