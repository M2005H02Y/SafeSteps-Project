
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Search,
  Trash2,
  FileText,
  Edit,
} from 'lucide-react';
import { getStandards, deleteStandard, Standard } from '@/lib/data';
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

function PageSkeleton() {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Standards" description="Gestion des documents standards et procédures">
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

function StandardsPageContent() {
  const router = useRouter();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [standardToDelete, setStandardToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshStandards = () => {
    const freshData = getStandards();
    setStandards(freshData);
  };

  useEffect(() => {
    refreshStandards();
  }, []);

  const filteredStandards = useMemo(() => {
    return standards.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [standards, searchTerm]);
  
  const openDeleteDialog = (id: string) => {
    setStandardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (standardToDelete) {
      const success = deleteStandard(standardToDelete);
      if (success) {
        toast({ title: "Norme supprimée" });
        refreshStandards();
      } else {
        toast({ title: "Erreur", description: "La suppression de la norme a échoué.", variant: "destructive" });
      }
      setStandardToDelete(null);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Standards" description="Gestion des documents standards et procédures">
            <Button asChild className="gradient-primary">
                <Link href="/standards/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouveau Standard
                </Link>
            </Button>
        </PageHeader>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Card className="mb-6 glass-effect">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher par nom, catégorie, description..." 
                    className="pl-9 bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {filteredStandards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStandards.map((standard) => (
                    <Link href={`/standards/${standard.id}`} key={standard.id} className="block hover:-translate-y-1 transition-transform duration-200">
                        <Card className="h-full flex flex-col glass-effect hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="truncate" title={standard.name}>{standard.name}</CardTitle>
                                <div className="flex items-center gap-2 pt-1 overflow-hidden min-w-0">
                                    <Badge variant="outline" className="truncate" title={standard.category}>
                                    {standard.category}
                                    </Badge>
                                    <Badge variant="secondary" className="flex-shrink-0">{standard.version}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {standard.image && (
                                    <div className="relative aspect-video w-full mb-4 rounded-md overflow-hidden">
                                        <Image src={standard.image} alt={standard.name} fill={true} className="object-cover" data-ai-hint="certificate document" />
                                    </div>
                                )}
                                <CardDescription className="line-clamp-3">
                                    {standard.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-600 hover:bg-slate-200"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/standards/${standard.id}/edit`);
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
                                        openDeleteDialog(standard.id);
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
                    <FileText className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold">Aucun standard trouvé</h3>
                    <p className="mt-2">Essayez d'ajuster votre recherche ou <Link href="/standards/new" className="text-primary underline">créez un nouveau standard</Link>.</p>
                </div>
            )}
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Elle supprimera définitivement le standard.
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

export default function StandardsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StandardsPageContent />
    </Suspense>
  )
}
