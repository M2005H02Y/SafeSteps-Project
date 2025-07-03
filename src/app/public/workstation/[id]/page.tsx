"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, FileText as FileTextIcon, Download, File } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [data, setData] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = atob(decodeURIComponent(dataParam));
        const parsedData: Workstation = JSON.parse(decodedData);
        setData(parsedData);
      } catch (e) {
        console.error("Failed to parse data from URL", e);
        setError("Impossible de charger les données. Le lien est peut-être corrompu.");
      }
    } else {
        setError("Aucune donnée fournie dans l'URL.");
    }
    setLoading(false);
  }, [dataParam]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
          <span className="font-semibold">WorkHub Central</span>
        </div>
        <Skeleton className="w-full max-w-md h-[400px] mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4 text-center">
         <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-destructive">Erreur</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const tableHeaders = data.tableData && data.tableData.length > 0 ? Object.keys(data.tableData[0]) : [];

  return (
    <main className="bg-muted min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
            <span className="font-semibold text-lg">WorkHub Central</span>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                    <Building2 className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-2xl md:text-3xl break-words">Détails du poste de travail</CardTitle>
                    <CardDescription>Informations publiques pour le poste de travail sélectionné.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
                <div>
                    <dt className="font-semibold text-lg">Nom</dt>
                    <dd className="text-muted-foreground break-words">{data.name}</dd>
                </div>
                {data.description && (
                    <div>
                        <dt className="font-semibold text-lg">Description</dt>
                        <dd className="text-muted-foreground break-words">{data.description}</dd>
                    </div>
                )}
            </dl>
          </CardContent>
        </Card>

        {data.image && (
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full">
                <Image src={data.image} alt={data.name} layout="fill" objectFit="cover" className="rounded-lg" />
              </div>
            </CardContent>
          </Card>
        )}

        {data.tableData && data.tableData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Procédures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      {tableHeaders.map((header) => <TableHead key={header} className="capitalize">{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.tableData?.map((row, index) => (
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

        {data.files && data.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fichiers joints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.files.map(file => (
                <div key={file.name} className="flex items-center justify-between p-3 rounded-md border bg-background">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={file.url} download={file.name}>
                      <Download className="h-4 w-4"/>
                      <span className="sr-only">Télécharger</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}
