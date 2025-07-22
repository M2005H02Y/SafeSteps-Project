
"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef, createRef, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, FileText, Table, Trash2, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addForm, TableData, FileAttachment, ContentBlock, Standard, getStandards } from '@/lib/data';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';
import FileUpload from '@/components/file-upload';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import RichTextEditor from '@/components/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [edition, setEdition] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [pageCount, setPageCount] = useState<number | ''>('');
  
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const blockRefs = useRef<React.RefObject<any>[]>([]);

  // NOUVEAU: Pour les standards
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<string | undefined>();

  useEffect(() => {
    const fetchStandards = async () => {
      const data = await getStandards();
      setStandards(data);
    };
    fetchStandards();
  }, []);

  // Sync refs array with blocks
  blockRefs.current = blocks.map((_, i) => blockRefs.current[i] ?? createRef());

  const addBlock = (type: 'paragraph' | 'table') => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`, // simple unique id
      type,
    };
    if (type === 'paragraph') newBlock.template = '';
    if (type === 'table') newBlock.data = undefined;

    setBlocks(prev => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const updateBlock = (id: string, newContent: Partial<ContentBlock>) => {
    setBlocks(prev => prev.map(block => block.id === id ? { ...block, ...newContent } : block));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setIssueDate(date);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    if (!isNaN(parsedDate.getTime())) {
        setIssueDate(parsedDate);
    } else {
        setIssueDate(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name.trim()) {
        toast({
            title: "Erreur de validation",
            description: "Le nom du formulaire est obligatoire.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalBlocks = blocks.map((block, index) => {
        if (block.type === 'table') {
          const tableData = blockRefs.current[index]?.current?.getTableData();
          return { ...block, data: tableData };
        }
        return block;
      }).filter(block => {
        // Filter out empty blocks
        if (block.type === 'paragraph' && (!block.template || !block.template.trim().replace(/<[^>]+>/g, ''))) return false;
        if (block.type === 'table' && !block.data) return false;
        return true;
      });
      
      const success = await addForm({ 
        name, 
        reference,
        edition,
        issue_date: issueDate ? format(issueDate, 'yyyy-MM-dd') : null,
        page_count: pageCount === '' ? null : Number(pageCount),
        content_blocks: finalBlocks,
        files,
        standard_id: selectedStandard || null,
      });

      if (success) {
        toast({
          title: "Formulaire créé",
          description: "Le nouveau formulaire a été enregistré avec succès.",
        });
        router.push('/forms');
      } else {
         throw new Error("API call failed");
      }
    } catch (error) {
       toast({
        title: "Erreur d'enregistrement",
        description: "Impossible de sauvegarder le formulaire. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Créer un nouveau formulaire">
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
              Enregistrer le formulaire
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du formulaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">Nom du formulaire</Label>
              <Input id="form-name" placeholder="ex: Check-list quotidienne de l'équipement" required value={name} onChange={e => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="standard-select">Standard Associé (Optionnel)</Label>
                <Select onValueChange={setSelectedStandard} value={selectedStandard}>
                    <SelectTrigger id="standard-select">
                        <SelectValue placeholder="Sélectionnez un standard" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {standards.map(standard => (
                            <SelectItem key={standard.id} value={standard.id}>{standard.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="space-y-2">
                <Label htmlFor="form-reference">Référence</Label>
                <Input id="form-reference" placeholder="ex: FRM-SEC-001" value={reference} onChange={e => setReference(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="form-edition">Édition</Label>
                <Input id="form-edition" placeholder="ex: V2.1" value={edition} onChange={e => setEdition(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-issue-date">Date d'émission</Label>
                 <Popover>
                    <div className="relative">
                        <Input
                            id="form-issue-date"
                            placeholder="jj/mm/aaaa"
                            value={issueDate ? format(issueDate, 'dd/MM/yyyy') : ''}
                            onChange={handleDateInputChange}
                            className="pr-10"
                        />
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                    </div>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={new Date().getFullYear() - 10}
                            toYear={new Date().getFullYear() + 5}
                            selected={issueDate}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={fr}
                        />
                    </PopoverContent>
                </Popover>
              </div>
               <div className="space-y-2">
                <Label htmlFor="form-page-count">Nombre de pages</Label>
                <Input 
                    id="form-page-count" 
                    type="number" 
                    placeholder="ex: 3" 
                    value={pageCount} 
                    onChange={e => setPageCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))} 
                    min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pièces jointes</CardTitle>
            <CardDescription>Ajoutez des fichiers pertinents au formulaire.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload initialFiles={files} onUploadComplete={setFiles} />
          </CardContent>
        </Card>

        {/* --- Modular Content Blocks --- */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Contenu du Formulaire</h3>
            {blocks.map((block, index) => (
                <Card key={block.id} className="relative group/block">
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 cursor-grab" title="Réorganiser (prochainement)">
                            <GripVertical className="h-4 w-4"/>
                        </Button>
                        <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeBlock(block.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {block.type === 'paragraph' && (
                        <>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Bloc Paragraphe</CardTitle>
                                <CardDescription>Permet de créer un formulaire textuel avec des champs intégrés et du formatage.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RichTextEditor
                                  initialValue={block.template || ''}
                                  onChange={(html) => updateBlock(block.id, { template: html })}
                                />
                                <p className="text-xs text-muted-foreground mt-2">Astuce : utilisez `[champ]` pour les champs dynamiques et la barre d'outils pour le style.</p>
                            </CardContent>
                        </>
                    )}
                    {block.type === 'table' && (
                        <>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Table className="h-5 w-5"/> Bloc Tableau</CardTitle>
                                <CardDescription>Permet de créer un formulaire basé sur une grille.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedDynamicTable ref={blockRefs.current[index]} initialData={block.data} />
                            </CardContent>
                        </>
                    )}
                </Card>
            ))}
            
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouveau bloc</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => addBlock('paragraph')}><FileText className="mr-2 h-4 w-4"/> Paragraphe</Button>
                    <Button type="button" variant="outline" onClick={() => addBlock('table')}><Table className="mr-2 h-4 w-4"/> Tableau</Button>
                </CardContent>
            </Card>
        </div>

      </main>
    </form>
  );
}
