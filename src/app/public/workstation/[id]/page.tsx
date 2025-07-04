"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info } from 'lucide-react';
import Image from 'next/image';
import { Workstation } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  if (!dataParam) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Aucune donnée fournie pour afficher cette page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  let data: Workstation;
  try {
    data = JSON.parse(atob(decodeURIComponent(dataParam)));
  } catch (error) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Les données fournies sont invalides ou corrompues.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const tableHeaders = data.tableData && data.tableData.length > 0 ? Object.keys(data.tableData[0]) : [];

  return (
    <main className="p-4 md:p-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="break-words">{data.name || <Skeleton className="h-8 w-3/4" />}</CardTitle>
                {data.description && <CardDescription className="break-words pt-2">{data.description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video w-full mb-6">
                     <Image src="https://placehold.co/600x400.png" alt="Placeholder" width={600} height={400} className="rounded-lg w-full h-auto object-cover" data-ai-hint="assembly line" />
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                        L'image et les fichiers ne sont pas chargés via le code QR. Pour voir tous les détails, veuillez consulter cet élément dans l'application principale.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>

        {data.tableData && data.tableData.length > 0 && (
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
                                {data.tableData.map((row, index) => (
                                    <TableRow key={index}>
                                        {tableHeaders.map((header) => <TableCell key={header}>{row[header]}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </main>
  );
}
