"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PlusCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setForms(getForms());
  }, []);

  const openDeleteDialog = (id: string) => {
    setSelectedFormId(id);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (selectedFormId) {
      const success = deleteForm(selectedFormId);
      if (success) {
        toast({
          title: "Formulaire supprimé",
          description: "Le formulaire a été supprimé avec succès.",
        });
        setForms(getForms());
      } else {
        toast({
          title: "Erreur",
          description: "La suppression du formulaire a échoué.",
          variant: "destructive",
        });
      }
      setSelectedFormId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Formulaires">
          <Button asChild>
            <Link href="/forms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un formulaire
            </Link>
          </Button>
        </PageHeader>
        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">
                        <Link href={`/forms/${form.id}`} className="hover:underline">
                          {form.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{form.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{form.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/forms/${form.id}`}>Voir</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/forms/${form.id}/edit`}>Modifier</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDeleteDialog(form.id)} className="text-red-600">Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Elle supprimera définitivement le formulaire et toutes les données associées.
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
