
"use client";

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Form, getFormById } from '@/lib/data';
import { b64_to_utf8 } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText, FileSpreadsheet, Download, Image as ImageIcon, File as FileIcon, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

function PublicPageLayout({ children, title, subtitle, type }: { children: React.ReactNode, title: string, subtitle?: string, type: 'workstation' | 'standard' | 'form' }) {
    const typeInfo = {
        workstation: { icon: <FileText className="h-8 w-8 text-blue-500" />, color: "blue" },
        standard: { icon: <FileText className="h-8 w-8 text-green-500" />, color: "green" },
        form: { icon: <FileText className="h-8 w-8 text-purple-500" />, color: "purple" }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
            <header className="bg-primary text-primary-foreground p-4 shadow-md">
                <div className="container mx-auto flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <FileText className="h-6 w-6"/>
                    </div>
                    <h1 className="text-xl font-bold">WorkHub Central - Accès Public</h1>
                </div>
            </header>
            <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-6">
                <Card className="glass-effect">
                    <CardHeader>
                        <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
                        {subtitle && <CardDescription>{subtitle}</CardDescription>}
                    </CardHeader>
                </Card>
                {children}
            </main>
             <footer className="text-center p-4 text-slate-500 text-xs mt-8">
                <p>Ceci est une page de consultation publique. Les informations sont en lecture seule.</p>
                <p>WorkHub Central © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}


export default function PublicFormPage({ params, searchParams }: { params: { id: string }, searchParams: { data?: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let tableHeaders: string[] = [];

  useEffect(() => {
    try {
      if (searchParams.data) {
        const decodedData = b64_to_utf8(decodeURIComponent(searchParams.data));
        if (!decodedData) throw new Error("Les données du QR code sont invalides ou corrompues.");
        
        const parsedData: Form = JSON.parse(decodedData);
        if(parsedData.id !== params.id) throw new Error("Incohérence des données : L'ID du QR code ne correspond pas à l'URL.");
        
        setForm(parsedData);
      } else {
        // Fallback to fetch from local storage if no data in QR
        const storedForm = getFormById(params.id);
        if (!storedForm) throw new Error("Ce formulaire est introuvable ou n'existe plus.");
        setForm(storedForm);
      }
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue lors du chargement des données.");
    } finally {
        setLoading(false);
    }
  }, [params.id, searchParams.data]);

  if (loading) {
    return (
      <PublicPageLayout title="Chargement du formulaire..." type="form">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-slate-700">Veuillez patienter...</p>
          <p className="text-sm text-slate-500">Nous vérifions les informations de sécurité et chargeons les données.</p>
        </div>
      </PublicPageLayout>
    )
  }

  if (error) {
    return (
      <PublicPageLayout title="Erreur" type="form">
        <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex-row items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                    <CardTitle className="text-red-700">Impossible de charger la page</CardTitle>
                    <CardDescription className="text-red-600">{error}</CardDescription>
                </div>
            </CardHeader>
        </Card>
      </PublicPageLayout>
    )
  }

  if (!form) {
    return notFound();
  }

  if (form.tableData && form.tableData.length > 0) {
    tableHeaders = Object.keys(form.tableData[0]);
  }

  return (
    <PublicPageLayout title={form.name} type="form" subtitle={`Type: ${form.type} | Mis à jour le: ${form.lastUpdated}`}>
      {form.files && form.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.files.map(file => (
              <a key={file.name} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'pdf' && <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />}
                    {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    {file.type === 'image' && <ImageIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />}
                    {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Download className="h-5 w-5 text-slate-500 flex-shrink-0"/>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {form.tableData && form.tableData.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Détails du Formulaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <TableHead key={header} className="capitalize">{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.tableData.map((row, index) => (
                    <TableRow key={index}>
                      {tableHeaders.map((header) => (
                        <TableCell key={header}>
                          <span className="text-slate-500 italic">[{row[header] || 'Champ à remplir'}]</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </PublicPageLayout>
  );
}
