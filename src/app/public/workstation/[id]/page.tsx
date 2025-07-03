"use client";

import { useSearchParams, useParams, notFound } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getWorkstationById, Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { File, FileText as FileTextIcon } from 'lucide-react';

function PublicWorkstationPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [workstation, setWorkstation] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dataFound: Workstation | null | undefined = null;
    const encodedData = searchParams.get('data');

    if (encodedData) {
      try {
        dataFound = JSON.parse(atob(encodedData));
      } catch (e) {
        console.error("Failed to decode data from URL", e);
      }
    }
    
    if (!dataFound) {
      dataFound = getWorkstationById(id);
    }
    
    if (dataFound) {
      setWorkstation(dataFound);
    }

    setLoading(false);
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!workstation) {
    notFound();
  }
  
  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{workstation.name}</CardTitle>
          {workstation.description && <CardDescription className="text-base">{workstation.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {workstation.image && (
            <div className="relative aspect-video w-full mb-6">
              <Image src={workstation.image} alt={workstation.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="assembly line" />
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
                      {tableHeaders.map((header) => <TableCell key={header}>{row[header]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {workstation.files && workstation.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fichiers joints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workstation.files.map(file => (
              <div key={file.name} className="flex items-center gap-3 p-2 rounded-md border">
                {file.type === 'pdf' ? <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <File className="h-5 w-5 text-green-500 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{file.name}</span>
                <Badge variant="secondary" className="ml-auto">{file.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PublicWorkstationPage() {
  return (
    <Suspense fallback={
        <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[200px] w-full" />
        </div>
    }>
      <PublicWorkstationPageContent />
    </Suspense>
  )
}
