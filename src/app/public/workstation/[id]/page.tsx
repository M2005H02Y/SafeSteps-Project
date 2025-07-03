"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicWorkstationPage() {
    const searchParams = useSearchParams();
    const [workstation, setWorkstation] = useState<Workstation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = JSON.parse(atob(data));
                setWorkstation(decodedData);
            } catch (e) {
                console.error("Failed to parse workstation data from URL", e);
                setError("Les données n'ont pas pu être lues. Le code QR est peut-être invalide ou obsolète.");
            }
        } else {
            setError("Aucune donnée trouvée dans l'URL. Le code QR est peut-être invalide.");
        }
        setLoading(false);
    }, [searchParams]);

    const pageHeader = (
        <header className="flex items-center gap-3 mb-8 w-full max-w-4xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 />
            </div>
            <h1 className="text-2xl font-bold">WorkHub Central</h1>
        </header>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
                {pageHeader}
                <main className="w-full max-w-4xl space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }
    
    if (error || !workstation) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
                {pageHeader}
                <main className="w-full max-w-4xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Erreur</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{error || "Impossible d'afficher le poste de travail."}</p>
                    </CardContent>
                  </Card>
                </main>
            </div>
        )
    }

    const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
            {pageHeader}
            <main className="w-full max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="break-words">{workstation.name}</CardTitle>
                        {workstation.description && <CardDescription className="break-words">{workstation.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        {workstation.image && (
                            <div className="relative aspect-video w-full mb-4">
                                <Image src={workstation.image} alt={workstation.name} layout="fill" objectFit="cover" className="rounded-lg" />
                            </div>
                        )}
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
            </main>
        </div>
    );
}
