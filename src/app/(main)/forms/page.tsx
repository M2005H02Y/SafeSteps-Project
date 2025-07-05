

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
  File as FileIconLucide,
  Printer,
  Edit,
  FileText as FileTextIcon,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { getForms, deleteForm, Form } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { getCloudinaryImagePreview } from '@/lib/utils';
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// Component for displaying form details
function FormDetails({ form }: { form: Form | null }) {
  if (!form) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const pdfFile = form.files?.find(f => f.type === 'pdf');
  const mainImagePreview = pdfFile ? getCloudinaryImagePreview(pdfFile.url) : form.files?.find(f => f.type === 'image')?.url;

  return (
    <ScrollArea className="h-[calc(100vh-160px)] no-scroll-for-print">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
        {/* Left column (main content) */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="glass-effect">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="break-words text-2xl">{form.name}</CardTitle>
                        <CardDescription className="break-words pt-2 flex items-center gap-2">
                           <Badge variant="secondary">{form.type}</Badge> -
                           <span>Dernière mise à jour: {form.lastUpdated}</span>
                        </CardDescription>
                    </div>
                    <div className="print-hidden flex flex-col gap-2">
                         <Button asChild variant="outline">
                            <Link href={`/forms/${form.id}/edit`}>
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
            </Card>

            {pdfFile ? (
              <Card className="glass-effect">
                  <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                  <CardContent>
                      <iframe src={pdfFile.url} className="w-full h-[800px] border rounded-md" title={pdfFile.name}></iframe>
                  </CardContent>
              </Card>
            ) : mainImagePreview ? (
              <Card className="glass-effect">
                  <CardHeader><CardTitle>Aperçu du formulaire</CardTitle></CardHeader>
                  <CardContent>
                    <Image src={mainImagePreview} alt={form.name} width={800} height={1100} className="w-full h-auto rounded-md border" />
                  </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-[400px] glass-effect">
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                    <p>Aucun aperçu disponible.</p>
                    <p className="text-sm">Téléchargez un PDF ou une image pour le voir ici.</p>
                </div>
              </Card>
            )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QRCode type="form" id={form.id} data={form} />
          
          {form.files && form.files.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Fichiers joints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.files.map(file => (
                  <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                      {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                      {file.type === 'other' && <FileIconLucide className="h-5 w-5 text-gray-500 flex-shrink-0" />}
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
        <PageHeader title="Formulaires" description="Gestion des formulaires configurables">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <main className="flex-1 p-4 md:p-6 grid gap-6 lg:grid-cols-3 overflow-hidden">
          <div className="lg:col-span-1 flex flex-col gap-6 print-hidden">
            <Card>
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
              <Card className="flex items-center justify-center h-full print-hidden">
                <div className="text-center text-muted-foreground p-8">
                  <FileIconLucide className="mx-auto h-16 w-16 mb-4" />
                  <h3 className="text-xl font-semibold">Chargement...</h3>
                </div>
              </Card>
          </div>
        </main>
      </div>
    );
  }

function FormsPageContent() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshForms = () => {
    const freshData = getForms();
    setForms(freshData);
    if (selectedForm) {
        const updatedSelected = freshData.find(f => f.id === selectedForm.id) || null;
        setSelectedForm(updatedSelected);
    }
  };

  useEffect(() => {
    refreshForms();
  }, []);

  const filteredForms = useMemo(() => {
    return forms.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [forms, searchTerm]);
  
  useEffect(() => {
    if (selectedForm && !forms.find(f => f.id === selectedForm.id)) {
        setSelectedForm(null);
    }
  }, [forms, selectedForm]);

  useEffect(() => {
    if (selectedForm && !filteredForms.find(f => f.id === selectedForm.id)) {
      setSelectedForm(null);
    }
  }, [filteredForms, selectedForm]);

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
      <div className="flex flex-col h-full overflow-hidden">
        <div className="print-hidden">
            <PageHeader title="Formulaires" description="Gestion des formulaires configurables">
                <Button asChild className="gradient-primary">
                    <Link href="/forms/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Formulaire
                    </Link>
                </Button>
            </PageHeader>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="lg:col-span-1 flex flex-col h-full gap-6 print-hidden">
                <Card className="glass-effect">
                  <CardContent className="p-4">
                    <div className="relative">
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

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-2 pr-4">
                            <h3 className="text-sm font-medium text-muted-foreground px-2">Formulaires ({filteredForms.length})</h3>
                            {filteredForms.map((form) => (
                                <Card 
                                    key={form.id} 
                                    className={cn(
                                        "cursor-pointer transition-all duration-200 border-2",
                                        selectedForm?.id === form.id ? "border-primary bg-primary/10" : "border-transparent bg-white/60 hover:border-primary/50"
                                    )}
                                    onClick={() => setSelectedForm(form)}
                                >
                                    <CardContent className="p-4 flex items-start justify-between">
                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="font-bold text-slate-800 truncate" title={form.name}>{form.name}</div>
                                          <Badge variant="secondary" className="font-normal">{form.type}</Badge>
                                          <div className="text-xs text-muted-foreground pt-1">
                                              Mis à jour le {new Date(form.lastUpdated).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                                                <Link href={`/forms/${form.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(form.id);
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
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={30}>
              <div className="h-full overflow-hidden workstation-details-print-full pl-6">
                {selectedForm ? (
                  <FormDetails form={selectedForm} />
                ) : (
                  <Card className="glass-effect flex items-center justify-center h-full print-hidden">
                    <div className="text-center text-muted-foreground p-8">
                      <FileIconLucide className="mx-auto h-16 w-16 mb-4" />
                      <h3 className="text-xl font-semibold">Sélectionner un formulaire</h3>
                      <p>Choisissez un formulaire dans la liste pour voir ses détails.</p>
                    </div>
                  </Card>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolutely sûr?</AlertDialogTitle>
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
