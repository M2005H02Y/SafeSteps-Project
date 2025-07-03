import { notFound } from 'next/navigation';
import { getWorkstationById } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { File, FileText as FileTextIcon } from 'lucide-react';
import Link from 'next/link';

export default function PublicWorkstationPage({ params }: { params: { id: string } }) {
  const workstation = getWorkstationById(params.id);

  if (!workstation) {
    notFound();
  }

  const tableHeaders = workstation.tableData && workstation.tableData.length > 0 ? Object.keys(workstation.tableData[0]) : [];

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <main className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
              <CardTitle className="text-3xl">{workstation.name}</CardTitle>
              <CardDescription>{workstation.description}</CardDescription>
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
                <Link key={file.name} href={file.url} download={file.name} className="flex items-center justify-between p-3 rounded-md border hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    {file.type === 'pdf' ? <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" /> : <File className="h-6 w-6 text-green-500 flex-shrink-0" />}
                    <span className="text-md font-medium truncate">{file.name}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
