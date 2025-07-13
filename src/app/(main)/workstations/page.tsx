
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Search,
  Trash2,
  Cog,
  Printer,
  FileText as FileTextIcon,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  Edit,
  File as FileIcon,
  ShieldCheck,
  HardHat,
  FileCheck,
  Biohazard,
  Shirt,
  Footprints,
  Hand,
  Glasses,
  Wind,
  EarOff,
  Activity,
  Shield,
  FileText,
  Mountain,
  Flame,
  Atom,
  Thermometer,
  Leaf,
  Bot,
  Drama
} from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import QRCode from '@/components/qr-code';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

const safetyIconMap: { [key: string]: React.ReactNode } = {
  // EPI
  'Tenue de Travail': <Shirt className="h-4 w-4 text-muted-foreground" />,
  'Casque': <HardHat className="h-4 w-4 text-muted-foreground" />,
  'Chaussures de sécurité': <Footprints className="h-4 w-4 text-muted-foreground" />,
  'Gants de sécurité ordinaires': <Hand className="h-4 w-4 text-muted-foreground" />,
  'Lunettes de Protection Ordinaires': <Glasses className="h-4 w-4 text-muted-foreground" />,
  'Masque à gaz': <Wind className="h-4 w-4 text-muted-foreground" />,
  'Casque anti-Bruit': <EarOff className="h-4 w-4 text-muted-foreground" />,
  'Harnais de sécurité': <Activity className="h-4 w-4 text-muted-foreground" />,
  'Écran Facial': <Shield className="h-4 w-4 text-muted-foreground" />,
  'Masque anti-poussière': <Wind className="h-4 w-4 text-muted-foreground" />,
  // Permis
  'Autorisation de Travail': <FileText className="h-4 w-4 text-muted-foreground" />,
  'Plan de Consignation': <FileText className="h-4 w-4 text-muted-foreground" />,
  'Espace Confiné': <Search className="h-4 w-4 text-muted-foreground" />,
  'Travaux en Hauteur': <Mountain className="h-4 w-4 text-muted-foreground" />,
  'Permis de Fouille': <Search className="h-4 w-4 text-muted-foreground" />,
  'Permis de Feu': <Flame className="h-4 w-4 text-muted-foreground" />,
  // Risques
  'Dangers Chimiques': <Atom className="h-5 w-5 text-destructive" />,
  'Dangers Physiques': <Thermometer className="h-5 w-5 text-destructive" />,
  'Dangers Environnementaux': <Leaf className="h-5 w-5 text-destructive" />,
  'Dangers Biologiques': <Biohazard className="h-5 w-5 text-destructive" />,
  'Dangers Ergonomiques': <Bot className="h-5 w-5 text-destructive" />,
  'Autres Dangers': <Drama className="h-5 w-5 text-destructive" />,
};


// Component for displaying workstation details
function WorkstationDetails({ workstation }: { workstation: Workstation | null }) {
  if (!workstation) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const hasSafetyData = (workstation.epi && workstation.epi.length > 0) || 
                       (workstation.special_permits && workstation.special_permits.length > 0) || 
                       (workstation.risks && workstation.risks.length > 0);

  return (
    <ScrollArea className="h-[calc(100vh-160px)] no-scroll-for-print">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
        {/* Left column (main content) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="break-words text-2xl">{workstation.name}</CardTitle>
                <CardDescription className="break-words pt-2 flex items-center gap-2">
                  <Badge variant="secondary">{workstation.type}</Badge>
                   - 
                  <span>{workstation.description}</span>
                </CardDescription>
              </div>
              <div className="print-hidden flex flex-col gap-2">
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
                <Button asChild variant="outline">
                    <Link href={`/workstations/${workstation.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                    </Link>
                </Button>
              </div>
            </CardHeader>
            {workstation.image && (
              <CardContent>
                    <div className="relative aspect-video w-full">
                        <Image src={workstation.image} alt={workstation.name} width={800} height={450} className="rounded-lg w-full h-auto object-cover" data-ai-hint="assembly line" />
                    </div>
              </CardContent>
            )}
          </Card>

          {hasSafetyData && (
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary"/> Informations de Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workstation.epi && workstation.epi.length > 0 && (
                    <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-2"><HardHat className="h-5 w-5"/>Équipements de Protection Individuelle (EPI)</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {workstation.epi.map(item => (
                          <li key={item} className="flex items-center gap-3">
                            {safetyIconMap[item] || <FileIcon className="h-4 w-4 text-muted-foreground" />}
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {workstation.special_permits && workstation.special_permits.length > 0 && (
                     <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-2"><FileCheck className="h-5 w-5"/>Permis Spéciaux</h3>
                       <ul className="space-y-2 text-sm text-muted-foreground">
                        {workstation.special_permits.map(item => (
                          <li key={item} className="flex items-center gap-3">
                            {safetyIconMap[item] || <FileIcon className="h-4 w-4 text-muted-foreground" />}
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {workstation.risks && workstation.risks.length > 0 && (
                     <div>
                      <h3 className="font-semibold flex items-center gap-2 mb-2"><Biohazard className="h-5 w-5"/>Principaux Risques Identifiés</h3>
                       <div className="space-y-2 text-sm">
                        {workstation.risks.map(risk => (
                          <div key={risk.category} className="p-2 border-l-4 border-destructive/50 bg-destructive/10 rounded-r-md">
                            <p className="font-semibold text-destructive flex items-center gap-2">
                              {safetyIconMap[risk.category] || <Biohazard className="h-5 w-5 text-destructive" />} 
                              {risk.category}
                            </p>
                            <p className="text-muted-foreground pl-9">{risk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
             </Card>
          )}
        
        </div>

        {/* Right column (sidebar-like content) */}
        <div className="space-y-6">
          <QRCode type="workstation" id={workstation.id} />
          
          {workstation.files && workstation.files.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Fichiers joints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workstation.files.map(file => (
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
  )
}

function PageSkeleton() {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Postes de Travail" description="Gestion des 11 types d'engines industriels">
          <Skeleton className="h-10 w-36" />
        </PageHeader>
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
           <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="flex flex-col h-full gap-6 print-hidden">
                <Card className="glass-effect">
                  <CardContent className="p-4">
                      <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
                <div className="flex-1 overflow-hidden">
                     <ScrollArea className="h-full">
                        <div className="space-y-2 pr-4">
                            <Skeleton className="h-5 w-24 mb-2" />
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-[76px] w-full" />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={30}>
               <div className="h-full overflow-hidden workstation-details-print-full pl-6">
                  <Card className="glass-effect flex items-center justify-center h-full print-hidden">
                    <div className="text-center text-muted-foreground p-8">
                      <Cog className="mx-auto h-16 w-16 mb-4 animate-spin" />
                      <h3 className="text-xl font-semibold">Chargement...</h3>
                      <p>Chargement des postes de travail.</p>
                    </div>
                  </Card>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    );
  }

function WorkstationsPageContent() {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workstationToDelete, setWorkstationToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const engineFilter = searchParams.get('engine');

  const refreshWorkstations = async () => {
    setLoading(true);
    try {
        const freshData = await getWorkstations();
        setWorkstations(freshData);
        if (selectedWorkstation) {
            const updatedSelected = freshData.find(ws => ws.id === selectedWorkstation.id) || null;
            setSelectedWorkstation(updatedSelected);
        }
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger les postes.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkstations();
  }, []);

  const filteredWorkstations = useMemo(() => {
    let results = workstations;
    if (engineFilter) {
      results = results.filter(ws => ws.type === engineFilter);
    }
    return results.filter(ws => ws.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [workstations, searchTerm, engineFilter]);

  useEffect(() => {
    if (selectedWorkstation && !workstations.find(ws => ws.id === selectedWorkstation.id)) {
        setSelectedWorkstation(null);
    }
  }, [workstations, selectedWorkstation]);

  useEffect(() => {
    if (selectedWorkstation && !filteredWorkstations.find(ws => ws.id === selectedWorkstation.id)) {
      setSelectedWorkstation(null);
    }
  }, [filteredWorkstations, selectedWorkstation]);

  const openDeleteDialog = (id: string) => {
    setWorkstationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (workstationToDelete) {
      const success = await deleteWorkstation(workstationToDelete);
      if (success) {
        toast({ title: "Poste de travail supprimé" });
        if (selectedWorkstation?.id === workstationToDelete) {
          setSelectedWorkstation(null);
        }
        refreshWorkstations();
      } else {
        toast({ title: "Erreur", description: "La suppression du poste de travail a échoué.", variant: "destructive" });
      }
      setWorkstationToDelete(null);
    }
  };
  
  if(loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="print-hidden">
          <PageHeader title="Postes de Travail" description={engineFilter ? `Filtré par: ${engineFilter}` : "Gestion des 11 types d'engines industriels"}>
            <Button asChild className="gradient-primary">
                <Link href="/workstations/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouveau Poste
                </Link>
              </Button>
          </PageHeader>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="flex flex-col h-full gap-6 print-hidden">
                <Card className="glass-effect">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher un poste..." 
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
                            <h3 className="text-sm font-medium text-muted-foreground px-2">Postes ({filteredWorkstations.length})</h3>
                            {filteredWorkstations.map((ws) => (
                                <Card 
                                    key={ws.id} 
                                    className={cn(
                                        "cursor-pointer transition-all duration-200 border-2",
                                        selectedWorkstation?.id === ws.id ? "border-primary bg-primary/10" : "border-transparent bg-white/60 hover:border-primary/50"
                                    )}
                                    onClick={() => setSelectedWorkstation(ws)}
                                >
                                    <CardContent className="p-4 flex items-start justify-between">
                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="font-bold text-slate-800 truncate" title={ws.name}>{ws.name}</div>
                                          <Badge variant="secondary" className="font-normal">{ws.type}</Badge>
                                          <div className="text-xs text-muted-foreground pt-1">
                                              Créé le {ws.created_at ? new Date(ws.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Date inconnue'}
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-2">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:bg-slate-200 shrink-0" asChild onClick={(e) => e.stopPropagation()}>
                                                <Link href={`/workstations/${ws.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(ws.id);
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
                {selectedWorkstation ? (
                  <WorkstationDetails workstation={selectedWorkstation} />
                ) : (
                  <Card className="glass-effect flex items-center justify-center h-full print-hidden">
                    <div className="text-center text-muted-foreground p-8">
                      <Cog className="mx-auto h-16 w-16 mb-4" />
                      <h3 className="text-xl font-semibold">{engineFilter ? `Postes de type ${engineFilter}` : 'Sélectionner un poste'}</h3>
                      <p>{filteredWorkstations.length > 0 ? `Choisissez un poste de travail dans la liste pour voir ses détails.` : `Aucun poste de travail trouvé pour "${engineFilter || searchTerm}".`}</p>
                    </div>
                  </Card>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
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

export default function WorkstationsPage() {
  return (
    <Suspense fallback={<PageSkeleton/>}>
      <WorkstationsPageContent />
    </Suspense>
  )
}
