
"use client";

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, TableData, logAnalyticsEvent } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Download, Loader2, FileArchive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ImprovedFillableTableProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
}

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function ImprovedFillableTable({ form, isOpen, onClose }: ImprovedFillableTableProps) {
  const { toast } = useToast();
  const [filledData, setFilledData] = useState<Record<string, string>>({});
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    return () => {
      if (zipBlobUrl) {
        URL.revokeObjectURL(zipBlobUrl);
      }
    };
  }, [zipBlobUrl]);

  useEffect(() => {
    if (!isOpen) {
      setIsGenerating(false);
      setZipBlobUrl(null);
    }
  }, [isOpen]);

  if (!form.table_data) return null;
  const tableData = form.table_data;

  const handleInputChange = (key: string, value: string) => {
    setFilledData(prev => ({ ...prev, [key]: value }));
  };

  const generateTimestamp = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}_${hours}h${minutes}`;
  };

  const generatePdfBlob = async (): Promise<Blob | null> => {
    const printableElement = document.getElementById('printable-table-container');
    if (!printableElement) return null;
    
    try {
        const canvas = await html2canvas(printableElement, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = canvas.width;
        const pdfHeight = canvas.height;
        const pdf = new jsPDF({ orientation: pdfWidth > pdfHeight ? 'l' : 'p', unit: 'px', format: [pdfWidth, pdfHeight] });
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf.output('blob');
    } catch (e) {
        console.error("PDF generation failed:", e);
        return null;
    }
  };

  const generateExcelBlob = (): Blob | null => {
    try {
      const aoa: (string | null)[][] = [];
      const merges = [];
  
      let headerRows = 0;
      let isHeaderRow = true;
      for (let r = 0; r < tableData.rows && isHeaderRow; r++) {
        let rowIsAllHeaders = true;
        for (let c = 0; c < tableData.cols; c++) {
          const key = getCellKey(r, c);
          if (!tableData.data[key]?.merged && !tableData.data[key]?.isHeader) {
            rowIsAllHeaders = false;
            break;
          }
        }
        if (rowIsAllHeaders) headerRows++;
        else isHeaderRow = false;
      }
  
      for (let r = 0; r < tableData.rows; r++) {
        const rowData: (string | null)[] = [];
        for (let c = 0; c < tableData.cols; c++) {
          const key = getCellKey(r, c);
          const cell = tableData.data[key];
  
          if (cell?.merged) {
            rowData.push(null);
            continue;
          }
  
          const originalContent = cell?.content || '';
          const filledContent = filledData[key] || '';
          const fullContent = cell?.isHeader ? originalContent : [originalContent, filledContent].filter(Boolean).join('\n\n');
          rowData.push(fullContent);
  
          if (cell?.colspan || cell?.rowspan) {
            const rowspan = cell.rowspan || 1;
            const colspan = cell.colspan || 1;
            if (rowspan > 1 || colspan > 1) {
              merges.push({
                s: { r: r, c: c },
                e: { r: r + rowspan - 1, c: c + colspan - 1 }
              });
            }
          }
        }
        aoa.push(rowData);
      }
  
      const worksheet = XLSX.utils.aoa_to_sheet(aoa);
      worksheet['!merges'] = merges;
      
      const colWidths = Array.from({ length: tableData.cols }).map((_, c) => {
        let max_width = 0;
        for (let r = 0; r < aoa.length; r++) {
            if (aoa[r][c]) {
                const cell_length = aoa[r][c]!.split('\n')[0].length;
                if (cell_length > max_width) {
                    max_width = cell_length;
                }
            }
        }
        return { wch: Math.min(max_width + 2, 60) };
    });
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses Formulaire');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"});
    } catch (e) {
        console.error("Excel generation failed:", e);
        return null;
    }
  };

  const handleGenerateZip = async () => {
    setIsGenerating(true);
    if (zipBlobUrl) {
      URL.revokeObjectURL(zipBlobUrl);
    }
    setZipBlobUrl(null);
    toast({ title: "Préparation des fichiers...", description: "Veuillez patienter pendant la génération du PDF et de l'Excel." });

    const pdfBlob = await generatePdfBlob();
    const excelBlob = generateExcelBlob();

    if (!pdfBlob || !excelBlob) {
        toast({ title: "Erreur de génération", description: "Impossible de créer un ou plusieurs fichiers.", variant: "destructive"});
        setIsGenerating(false);
        return;
    }

    try {
        const zip = new JSZip();
        const timestamp = generateTimestamp();
        zip.file(`${form.name}_${timestamp}.pdf`, pdfBlob);
        zip.file(`${form.name}_${timestamp}.xlsx`, excelBlob);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        setZipBlobUrl(URL.createObjectURL(zipBlob));
        toast({ title: "Fichiers prêts !", description: "Vous pouvez maintenant télécharger le fichier ZIP." });
        
        logAnalyticsEvent({
            event_type: 'form_filled',
            target_type: 'form',
            target_id: form.id,
        });

    } catch (e) {
        console.error("ZIP generation failed:", e);
        toast({ title: "Erreur ZIP", description: "La création du fichier ZIP a échoué.", variant: "destructive"});
    } finally {
        setIsGenerating(false);
    }
  };

  const zipFilename = `${form.name}_${generateTimestamp()}.zip`;

  const renderGridCell = (r: number, c: number) => {
    const key = getCellKey(r, c);
    const cellData = tableData.data[key];
    if (cellData?.merged) return null;

    if (cellData?.isHeader) {
      return (
        <div
          key={key}
          className="flex flex-col gap-2 p-3 border rounded-lg bg-slate-200 justify-center items-center"
          style={{ gridColumn: `span ${cellData?.colspan || 1}`, gridRow: `span ${cellData?.rowspan || 1}` }}
        >
          <Label className="text-base font-semibold text-slate-900 text-center">{cellData?.content}</Label>
        </div>
      );
    }

    return (
      <div 
        key={key} 
        className="flex flex-col gap-2 p-3 border rounded-lg bg-slate-50"
        style={{ gridColumn: `span ${cellData?.colspan || 1}`, gridRow: `span ${cellData?.rowspan || 1}` }}
      >
        <Label className="text-sm font-medium text-slate-800">{cellData?.content || ''}</Label>
        <Textarea
          placeholder="Votre réponse..."
          value={filledData[key] || ''}
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="h-24 bg-white"
        />
      </div>
    );
  };
  
  const metadataItems = [
    { label: "Référence", value: form.reference },
    { label: "Édition", value: form.edition },
    { label: "Date d'émission", value: form.issue_date ? format(new Date(form.issue_date), "dd MMMM yyyy", { locale: fr }) : null },
    { label: "Pages", value: form.page_count },
  ].filter(item => item.value);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Remplir le formulaire: {form.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6">
          <div id="printable-table-container-for-fill" className="p-4 bg-white grid gap-4" style={{ gridTemplateColumns: `repeat(${tableData.cols}, 1fr)` }}>
            {Array.from({ length: tableData.rows }).map((_, r) =>
              Array.from({ length: tableData.cols }).map((_, c) => renderGridCell(r, c))
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
          
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
            {isGenerating ? (
              <Button disabled className="w-full sm:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </Button>
            ) : zipBlobUrl ? (
              <Button asChild className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <a href={zipBlobUrl} download={zipFilename}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le ZIP
                </a>
              </Button>
            ) : (
              <Button onClick={handleGenerateZip} className="w-full sm:w-auto">
                <FileArchive className="mr-2 h-4 w-4" />
                Générer les Fichiers (PDF & Excel)
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Hidden printable element for PDF generation */}
        <div className="absolute -left-[9999px] top-0 w-[1200px]">
            <div id="printable-table-container" className="p-8 bg-white">
                <h2 className="text-3xl font-bold mb-2 text-black">{form.name}</h2>
                <p className="text-lg mb-4 text-black">Rempli le: {generateTimestamp().replace('_', ' à ')}</p>
                <div className="text-sm text-black mb-6 flex flex-wrap gap-x-6 gap-y-2 border-y py-2">
                    {metadataItems.map(item => (
                        <div key={item.label}>
                            <span className="font-bold">{item.label}:</span> {item.value}
                        </div>
                    ))}
                </div>
                <table className="border-collapse w-full text-black">
                    <tbody>
                        {Array.from({ length: tableData.rows }).map((_, r) => (
                            <tr key={`r-${r}`}>
                                {Array.from({ length: tableData.cols }).map((_, c) => {
                                    const key = getCellKey(r, c);
                                    const cell = tableData.data[key];
                                    if (cell?.merged) return null;

                                    const originalContent = cell?.content || '';
                                    const filledContent = filledData[key] || '';
                                    
                                    const CellComponent = cell?.isHeader ? 'th' : 'td';
                                    const cellStyle = {
                                      border: '1px solid black',
                                      padding: '8px',
                                      verticalAlign: 'top',
                                      fontSize: '14px',
                                      backgroundColor: cell?.isHeader ? '#E2E8F0' : '#FFFFFF',
                                    };

                                    return (
                                        <CellComponent
                                            key={key}
                                            colSpan={cell?.colspan || 1}
                                            rowSpan={cell?.rowspan || 1}
                                            style={cellStyle}
                                        >
                                            <div style={{fontWeight: cell?.isHeader ? 'bold' : 'normal'}}>{originalContent}</div>
                                            {!cell?.isHeader && filledContent && (
                                                <div style={{marginTop: '4px', color: '#1E40AF', whiteSpace: 'pre-wrap'}}>{filledContent}</div>
                                            )}
                                        </CellComponent>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
