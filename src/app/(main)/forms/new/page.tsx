
"use client";

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addForm, TableData, FileAttachment } from '@/lib/data';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';
import FileUpload from '@/components/file-upload';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [edition, setEdition] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [dateInputValue, setDateInputValue] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>('');

  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isTableEnabled, setIsTableEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableRef = useRef<{ getTableData: () => TableData }>(null);

  const handleDateSelect = (date: Date | undefined) => {
    setIssueDate(date);
    setDateInputValue(date ? format(date, 'dd/MM/yyyy') : '');
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInputValue(e.target.value);
    const parsedDate = parse(e.target.value, 'dd/MM/yyyy', new Date());
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
      const tableData = isTableEnabled ? tableRef.current?.getTableData() : undefined;
      const success = await addForm({ 
        name, 
        reference,
        edition,
        issue_date: issueDate ? issueDate.toISOString().split('T')[0] : null,
        page_count: pageCount === '' ? null : Number(pageCount),
        table_data: tableData, 
        files 
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
                            value={dateInputValue}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Structure du tableau (Optionnel)</CardTitle>
                <CardDescription>Activez pour ajouter et configurer un tableau pour ce formulaire.</CardDescription>
              </div>
              <Switch
                id="table-toggle"
                checked={isTableEnabled}
                onCheckedChange={setIsTableEnabled}
                aria-label="Activer le tableau"
              />
            </div>
          </CardHeader>
          {isTableEnabled && (
            <CardContent>
              <EnhancedDynamicTable ref={tableRef} />
            </CardContent>
          )}
        </Card>

      </main>
    </form>
  );
}
