"use client";

import { useSearchParams, notFound } from 'next/navigation';
import { Workstation } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

function PublicWorkstationPageContent({ data }: { data: Workstation }) {
  const tableHeaders = data.tableData && data.tableData.length > 0 ? Object.keys(data.tableData[0]) : [];
  
  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="break-words">{data.name}</CardTitle>
          {data.description && <CardDescription className="break-words pt-2">{data.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {data.image && (
              <div className="relative aspect-video w-full">
                  <Image src={data.image} alt={data.name} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="assembly line"/>
              </div>
          )}
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
  );
}

function PageLoader() {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function PublicWorkstationPage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const [data, setData] = useState<Workstation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam));
        setData(decodedData);
      } catch (e) {
        console.error("Failed to parse data from URL", e);
        setError(true);
      }
    } else {
      setError(true);
    }
    setLoading(false);
  }, [dataParam]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !data) {
    notFound();
  }

  return <PublicWorkstationPageContent data={data} />;
}
