"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Workstation } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Helper function to safely decode a Base64 string to UTF-8
function b64_to_utf8(str: string): string {
    return decodeURIComponent(escape(atob(str)));
}

export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedJson = b64_to_utf8(decodeURIComponent(dataParam));
        const decodedData = JSON.parse(decodedJson);
        setWorkstation(decodedData);
      } catch (e) {
        console.error("Failed to parse workstation data from URL", e);
        setError("Les données du code QR sont corrompues ou invalides.");
      }
    } else {
      setError("Aucune donnée fournie pour afficher cette page. Veuillez scanner à nouveau un code QR valide.");
    }
  }, [dataParam]);
  
  const tableHeaders = workstation?.tableData && workstation.tableData.length > 0 
    ? Object.keys(workstation.tableData[0]) 
    : [];

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Erreur de données</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!workstation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement des données du poste de travail...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="break-words text-3xl">{workstation.name}</CardTitle>
                    {workstation.description && <CardDescription className="break-words text-base">{workstation.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <div className="relative aspect-video w-full">
                        <Image src="https://placehold.co/800x450.png" alt={workstation.name} layout="fill" className="rounded-lg object-cover" data-ai-hint="assembly line" />
                    </div>
                     <p className="text-sm text-muted-foreground mt-2 text-center">L'image principale et les fichiers joints ne sont pas affichés sur cette page publique.</p>
                </CardContent>
            </Card>

            {workstation.tableData && workstation.tableData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Procédures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {tableHeaders.map((header) => <TableHead key={header} className="capitalize">{header}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workstation.tableData.map((row, index) => (
                                        <TableRow key={index}>
                                            {tableHeaders.map((header) => <TableCell key={header} className="break-words">{row[header]}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="space-y-6 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Information</CardTitle>
                    <CardDescription>Cet aperçu est généré à partir d'un code QR et peut ne pas contenir toutes les données. L'image est un placeholder.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </div>
    </main>
  );
}
