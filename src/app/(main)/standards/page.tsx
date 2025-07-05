"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PlusCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function StandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setStandards(getStandards());
  }, []);

  const openDeleteDialog = (id: string) => {
    setSelectedStandardId(id);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (selectedStandardId) {
      const success = deleteStandard(selectedStandardId);
      if (success) {
        toast({
          title: "Norme supprimée",
          description: "La norme a été supprimée avec succès.",
        });
        setStandards(getStandards());
      } else {
        toast({
          title: "Erreur",
          description: "La suppression de la norme a échoué.",
          variant: "destructive",
        });
      }
      setSelectedStandardId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Normes">
          <Button asChild>
            <Link href="/standards/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une norme
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
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standards.map((standard) => (
                    <TableRow key={standard.id}>
                      <TableCell className="font-medium">
                        <Link href={`/standards/${standard.id}`} className="hover:underline">
                          {standard.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{standard.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{standard.version}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/standards/${standard.id}`}>Voir</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/standards/${standard.id}/edit`}>Modifier</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDeleteDialog(standard.id)} className="text-red-600">Supprimer</DropdownMenuItem>
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
              Cette action est irréversible. Elle supprimera définitivement la norme et toutes les données associées.
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
