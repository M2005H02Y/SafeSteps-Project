import { notFound } from 'next/navigation';
import { getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { File as FileIcon, FileText as FileTextIcon, ImageIcon, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function ReadOnlyTable({ tableData }: { tableData: Form['table_data'] }) {
    if (!tableData || !tableData.rows || !tableData.cols) {
        return (
            <div className="text-center text-slate-500 p-8">
                <p>Ce formulaire n'a pas de tableau configuré.</p>
            </div>
        );
    }
    
    const getCellKey = (r: number, c: number) => `${r}-${c}`;

    const renderCell = (r: number, c: number) => {
        const key = getCellKey(r,c);
        const cell = tableData.data[key] || { content: '' };
        if (cell.merged) return null;

        return (
            <td
                key={key}
                colSpan={cell.colspan}
                rowSpan={cell.rowspan}
                className="border border-slate-300 p-2 text-sm"
            >
                <div>{cell.content}</div>
            </td>
        );
    }

    return (
        <div className="overflow-auto rounded-md border shadow-sm">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {[...Array(tableData.cols)].map((_, c) => (
                            <th key={c} className="border border-slate-300 p-2 bg-slate-100 text-sm font-medium text-left">
                                {tableData.headers?.[c] || `Colonne ${c + 1}`}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(tableData.rows)].map((_, r) => (
                        <tr key={r}>
                            {[...Array(tableData.cols)].map((_, c) => renderCell(r,c))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default async function PublicFormPage({ params }: { params: { id: string } }) {
  const form = await getFormById(params.id);

  if (!form) {
    return notFound();
  }

  const imageFiles = form.files?.filter(f => f.type === 'image') || [];
  const otherFiles = form.files?.filter(f => f.type !== 'image') || [];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{form.name}</CardTitle>
          <CardDescription className="text-sm pt-2">
            Dernière mise à jour le {format(new Date(form.last_updated), "d MMMM yyyy", { locale: fr })}
          </CardDescription>
        </CardHeader>
      </Card>

      {form.table_data && (
        <Card>
            <CardHeader>
                <CardTitle>Tableau du formulaire</CardTitle>
            </CardHeader>
            <CardContent>
                <ReadOnlyTable tableData={form.table_data} />
            </CardContent>
        </Card>
      )}
      
      {imageFiles.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Images jointes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageFiles.map((file) => (
                   <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer">
                     <div className="relative aspect-video w-full rounded-lg overflow-hidden border hover:opacity-90 transition-opacity">
                        <Image src={file.url} alt={file.name} fill className="object-cover" data-ai-hint="form image" />
                     </div>
                   </a>
                ))}
            </CardContent>
        </Card>
      )}

      {otherFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{imageFiles.length > 0 ? 'Autres fichiers joints' : 'Fichiers joints'}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherFiles.map(file => (
              <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md border bg-slate-50 hover:bg-slate-100 transition-colors">
                {file.type === 'pdf' && <FileTextIcon className="h-6 w-6 text-red-500 flex-shrink-0" />}
                {file.type === 'excel' && <FileSpreadsheet className="h-6 w-6 text-green-500 flex-shrink-0" />}
                {file.type === 'other' && <FileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{file.name}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
