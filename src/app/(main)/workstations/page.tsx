"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { getWorkstations, deleteWorkstation, Workstation } from '@/lib/data';
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

export default function WorkstationsPage() {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setWorkstations(getWorkstations());
  }, []);

  const openDeleteDialog = (id: string) => {
    setSelectedWorkstationId(id);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (selectedWorkstationId) {
      const success = deleteWorkstation(selectedWorkstationId);
      if (success) {
        toast({
          title: "Poste de travail supprimé",
          description: "Le poste de travail a été supprimé avec succès.",
        });
        setWorkstations(getWorkstations());
      } else {
        toast({
          title: "Erreur",
          description: "La suppression du poste de travail a échoué.",
          variant: "destructive",
        });
      }
      setSelectedWorkstationId(null);
    }
  }


  return (
    <>
      <div className="flex flex-col h-full">
        <PageHeader title="Postes de travail">
          <Button asChild>
            <Link href="/workstations/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un poste de travail
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
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Ressources</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workstations.map((ws) => (
                    <TableRow key={ws.id}>
                      <TableCell className="font-medium">
                        <Link href={`/workstations/${ws.id}`} className="hover:underline">
                          {ws.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-sm truncate hidden md:table-cell">{ws.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex gap-1">
                          {ws.files && ws.files.length > 0 && <Badge variant="secondary">{ws.files.length} Fichiers</Badge>}
                          {ws.tableData && ws.tableData.length > 0 && <Badge variant="secondary">{ws.tableData.length} Étapes</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/workstations/${ws.id}`}>Voir</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/workstations/${ws.id}/edit`}>Modifier</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDeleteDialog(ws.id)} className="text-red-600">Supprimer</DropdownMenuItem>
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
              Cette action est irréversible. Elle supprimera définitivement le poste de travail et toutes les données associées.
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
