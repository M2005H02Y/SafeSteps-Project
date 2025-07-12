
"use client";

import { useRouter, useParams, notFound } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFormById, updateForm, Form, TableData, FileAttachment } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedDynamicTable from '@/components/enhanced-dynamic-table';
import FileUpload from '@/components/file-upload';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [edition, setEdition] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [pageCount, setPageCount] = useState<number | ''>('');
  
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [tableData, setTableData] = useState<TableData | undefined>(undefined);
  const [isTableEnabled, setIsTableEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef<{ getTableData: () => TableData }>(null);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        setIsLoading(true);
        const formData = await getFormById(id);
        if (formData) {
          setForm(formData);
          setName(formData.name);
          setReference(formData.reference || '');
          setEdition(formData.edition || '');
          setIssueDate(formData.issue_date ? new Date(formData.issue_date) : undefined);
          setPageCount(formData.page_count ?? '');
          
          setFiles(formData.files || []);

          if (formData.table_data) {
            setTableData(formData.table_data);
            setIsTableEnabled(true);
          } else {
            setIsTableEnabled(false);
          }
        }
        setIsLoading(false);
      }
      fetchForm();
    }
  }, [id]);

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
      const finalTableData = isTableEnabled ? tableRef.current?.getTableData() : undefined;
      const success = await updateForm(id, { 
        name,
        reference,
        edition,
        issue_date: issueDate ? issueDate.toISOString() : null,
        page_count: pageCount === '' ? null : Number(pageCount),
        table_data: finalTableData, 
        files 
      });

      if (success) {
        toast({
          title: "Formulaire mis à jour",
          description: "Le formulaire a été enregistré avec succès.",
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Chargement...">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
        </PageHeader>
        <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-4 gap-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
              </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return notFound();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title={`Modifier: ${form.name}`}>
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
              Enregistrer les modifications
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
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !issueDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {issueDate ? format(issueDate, "dd/MM/yyyy") : <span>Choisir une date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                captionLayout="dropdown-buttons"
                                fromYear={new Date().getFullYear() - 10}
                                toYear={new Date().getFullYear() + 5}
                                selected={issueDate}
                                onSelect={setIssueDate}
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
                <CardDescription>Activez pour ajouter ou modifier le tableau de ce formulaire.</CardDescription>
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
              <EnhancedDynamicTable
                ref={tableRef}
                initialData={tableData}
              />
            </CardContent>
          )}
        </Card>

      </main>
    </form>
  );
}
