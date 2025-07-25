
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  PlusCircle,
  Search,
  Trash2,
  FileText as FileTextIcon,
  Edit,
  Table,
} from 'lucide-react';
import { getForms, deleteForm, Form, getStandards, Standard } from '@/lib/data';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function PageSkeleton() {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Formulaires" description="Gestion des formulaires configurables">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <main className="flex-1 p-4 md:p-6">
            <div className="mb-6">
                 <Card>
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-9 w-full max-w-sm" />
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
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                        <CardFooter>
                           <div className="flex justify-end w-full gap-2">
                             <Skeleton className="h-8 w-8" />
                             <Skeleton className="h-8 w-8" />
                           </div>
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
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [formsData, standardsData] = await Promise.all([getForms(), getStandards()]);
      setForms(formsData);
      setStandards(standardsData);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredForms = useMemo(() => {
    return forms
      .filter(f => selectedStandardId === 'all' ? true : f.standard_id === selectedStandardId)
      .filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [forms, searchTerm, selectedStandardId]);

  const openDeleteDialog = (id: string) => {
    setFormToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (formToDelete) {
      const success = await deleteForm(formToDelete);
      if (success) {
        toast({ title: "Formulaire supprimé" });
        refreshData();
      } else {
        toast({ title: "Erreur", description: "La suppression du formulaire a échoué.", variant: "destructive" });
      }
      setFormToDelete(null);
    }
  };
  
  const getFormTypeInfo = (form: Form) => {
    const types = [];
    if (form.content_blocks?.some(b => b.type === 'paragraph')) {
        types.push({ icon: <FileTextIcon className="h-4 w-4" />, text: 'Paragraphe' });
    }
    if (form.content_blocks?.some(b => b.type === 'table')) {
        types.push({ icon: <Table className="h-4 w-4" />, text: 'Tableau' });
    }
    if (types.length === 0) {
       return [{ icon: <FileTextIcon className="h-4 w-4" />, text: 'Simple' }];
    }
    return types;
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher par nom, référence..." 
                        className="pl-9 bg-slate-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                       <Select onValueChange={setSelectedStandardId} value={selectedStandardId}>
                          <SelectTrigger className="w-full bg-slate-50">
                              <SelectValue placeholder="Filtrer par standard..." />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Tous les standards</SelectItem>
                              {standards.map(standard => (
                                  <SelectItem key={standard.id} value={standard.id}>{standard.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                         <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                            <CardFooter>
                            <div className="flex justify-end w-full gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : filteredForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredForms.map((form) => {
                      const typeInfo = getFormTypeInfo(form);
                      return (
                      <Link href={`/forms/${form.id}`} key={form.id} className="block hover:-translate-y-1 transition-transform duration-200">
                          <Card className="h-full flex flex-col glass-effect hover:shadow-xl transition-shadow">
                              <CardHeader>
                                  <CardTitle className="truncate" title={form.name}>{form.name}</CardTitle>
                                  <CardDescription>
                                      {form.reference ? <Badge variant="outline">{form.reference}</Badge> : 'Aucune référence'}
                                  </CardDescription>
                              </CardHeader>
                              <CardContent className="flex-grow space-y-2">
                                  <div className="text-sm text-muted-foreground flex items-center gap-x-4 gap-y-1 flex-wrap">
                                    <span className="font-semibold">Contenu:</span>
                                    {typeInfo.map(info => (
                                      <div key={info.text} className="flex items-center gap-1.5">
                                        {info.icon}
                                        <span>{info.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-xs text-muted-foreground pt-2">
                                      Mis à jour le {new Date(form.last_updated).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                    )})}
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
