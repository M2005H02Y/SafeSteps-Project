
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Search,
  Trash2,
  FileText,
  Printer,
  Edit,
  File as FileIcon,
  FileText as FileTextIcon,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import QRCode from '@/components/qr-code';
import { Skeleton } from '@/components/ui/skeleton';

// Component for displaying standard details
function StandardDetails({ standard }: { standard: Standard | null }) {
  if (!standard) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <ScrollArea className="h-[calc(100vh-160px)] no-scroll-for-print">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
        {/* Left column (main content) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-effect">
             <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="break-words text-2xl">{standard.name}</CardTitle>
                    <CardDescription className="break-words pt-2 flex items-center gap-2">
                        <Badge variant="secondary">{standard.category}</Badge>
                        -
                        <span>Version: {standard.version}</span>
                    </CardDescription>
                </div>
                <div className="print-hidden flex flex-col gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/standards/${standard.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Link>
                    </Button>
                     <Button onClick={handlePrint} variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimer
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {standard.image && (
                    <div className="relative aspect-video w-full mb-4">
                        <Image src={standard.image} alt={standard.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="certificate document"/>
                    </div>
                )}
                {standard.description && <p className="text-muted-foreground break-words">{standard.description}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Right column (sidebar-like content) */}
        <div className="space-y-6">
          <QRCode type="standard" id={standard.id} data={standard} />
          
          {standard.files && standard.files.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Fichiers joints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {standard.files.map(file => (
                  <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                      {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                      {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground ml-2"/>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

function PageSkeleton() {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Standards" description="Gestion des documents standards et procédures">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <main className="flex-1 p-4 md:p-6 grid gap-6 lg:grid-cols-3 overflow-hidden">
          <div className="lg:col-span-1 flex flex-col gap-6 print-hidden">
            <Card className="glass-effect">
              <CardContent className="p-4">
                  <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full">
                    <div className="space-y-2 pr-4">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-[76px] w-full" />
                        <Skeleton className="h-[76px] w-full" />
                        <Skeleton className="h-[76px] w-full" />
                    </div>
                </ScrollArea>
            </div>
          </div>
          <div className="lg:col-span-2 overflow-hidden workstation-details-print-full">
              <Card className="glass-effect flex items-center justify-center h-full print-hidden">
                <div className="text-center text-muted-foreground p-8">
                  <FileText className="mx-auto h-16 w-16 mb-4" />
                  <h3 className="text-xl font-semibold">Chargement...</h3>
                </div>
              </Card>
          </div>
        </main>
      </div>
    );
  }

function StandardsPageContent() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [standardToDelete, setStandardToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshStandards = () => {
    const freshData = getStandards();
    setStandards(freshData);
    if (selectedStandard) {
        const updatedSelected = freshData.find(s => s.id === selectedStandard.id) || null;
        setSelectedStandard(updatedSelected);
    }
  };

  useEffect(() => {
    refreshStandards();
  }, []);

  const filteredStandards = useMemo(() => {
    return standards.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [standards, searchTerm]);
  
  useEffect(() => {
    if (selectedStandard && !standards.find(s => s.id === selectedStandard.id)) {
        setSelectedStandard(null);
    }
  }, [standards, selectedStandard]);

  useEffect(() => {
    if (selectedStandard && !filteredStandards.find(s => s.id === selectedStandard.id)) {
      setSelectedStandard(null);
    }
  }, [filteredStandards, selectedStandard]);

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
      <div className="flex flex-col h-full overflow-hidden">
        <div className="print-hidden">
            <PageHeader title="Standards" description="Gestion des documents standards et procédures">
                <Button asChild className="gradient-primary">
                    <Link href="/standards/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Standard
                    </Link>
                </Button>
            </PageHeader>
        </div>
        <main className="flex-1 p-4 md:p-6 grid gap-6 lg:grid-cols-3 overflow-hidden">
          {/* Left Column */}
          <div className="lg:col-span-1 flex flex-col gap-6 print-hidden">
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher un standard..." 
                    className="pl-9 bg-slate-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full">
                    <div className="space-y-2 pr-4">
                        <h3 className="text-sm font-medium text-muted-foreground px-2">Standards ({filteredStandards.length})</h3>
                        {filteredStandards.map((standard) => (
                            <Card 
                                key={standard.id} 
                                className={cn(
                                    "cursor-pointer transition-all duration-200 border-2",
                                    selectedStandard?.id === standard.id ? "border-primary bg-primary/10" : "border-transparent bg-white/60 hover:border-primary/50"
                                )}
                                onClick={() => setSelectedStandard(standard)}
                            >
                                <CardContent className="p-4 flex items-start justify-between">
                                    <div className="flex-1 space-y-1 overflow-hidden">
                                      <div className="font-bold text-slate-800 truncate">{standard.name}</div>
                                      <div className="text-xs text-muted-foreground truncate">{standard.description || standard.category}</div>
                                      <div className="flex items-center gap-2 pt-1">
                                          <Badge variant="outline">{standard.category}</Badge>
                                          <Badge variant="secondary">{standard.version}</Badge>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-slate-600 hover:bg-slate-200 shrink-0"
                                            asChild
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link href={`/standards/${standard.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteDialog(standard.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 overflow-hidden workstation-details-print-full">
            {selectedStandard ? (
              <StandardDetails standard={selectedStandard} />
            ) : (
              <Card className="glass-effect flex items-center justify-center h-full print-hidden">
                <div className="text-center text-muted-foreground p-8">
                  <FileText className="mx-auto h-16 w-16 mb-4" />
                  <h3 className="text-xl font-semibold">Sélectionner un standard</h3>
                  <p>Choisissez un standard dans la liste pour voir ses détails.</p>
                </div>
              </Card>
            )}
          </div>
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
