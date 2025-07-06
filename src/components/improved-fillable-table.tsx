
"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { TableData, CellData } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImprovedFillableTableProps {
  formName: string;
  tableData?: TableData;
  isOpen: boolean;
  onClose: () => void;
}

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function ImprovedFillableTable({ formName, tableData, isOpen, onClose }: ImprovedFillableTableProps) {
  const { toast } = useToast();
  const [filledData, setFilledData] = useState<Record<string, string>>({});

  if (!tableData) return null;

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
    return `${day}-${month}-${year}_${hours}h${minutes}m`;
  };

  const exportToPDF = () => {
    try {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const timestamp = generateTimestamp();
        const filename = `${formName}_${timestamp}.pdf`;
        let y = 20;
        const pageMargin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(18);
        doc.text(`Formulaire Rempli: ${formName}`, pageMargin, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Date: ${timestamp}`, pageMargin, y);
        y += 15;

        for (let r = 0; r < tableData.rows; r++) {
            for (let c = 0; c < tableData.cols; c++) {
                const key = getCellKey(r, c);
                const cellData = tableData.data[key];
                if (cellData?.merged) continue;

                const filledContent = filledData[key] || '';
                if (!filledContent) continue; // Skip empty responses

                const cellHeader = tableData.headers?.[c] || `Colonne ${c + 1}`;
                const originalContent = cellData?.content || '';
                
                const contentBlock = `Case: ${cellHeader} (L${r + 1})
Contexte: ${originalContent || 'N/A'}
Réponse: ${filledContent}`;

                const textLines = doc.splitTextToSize(contentBlock, doc.internal.pageSize.getWidth() - (pageMargin * 2));
                
                const blockHeight = textLines.length * 7 + 5; // Estimate height

                if (y + blockHeight > pageHeight - pageMargin) {
                    doc.addPage();
                    y = pageMargin;
                }
                
                doc.setDrawColor(200, 200, 200);
                doc.rect(pageMargin, y, doc.internal.pageSize.getWidth() - (pageMargin * 2), blockHeight);
                
                doc.text(textLines, pageMargin + 5, y + 7);
                y += blockHeight + 5;
            }
        }
        doc.save(filename);
    } catch(e) {
        console.error(e);
        toast({ title: "Erreur PDF", description: "La génération du PDF a échoué.", variant: "destructive"});
    }
  };

  const exportToExcel = () => {
    try {
        const excelData: any[][] = [];
        const timestamp = generateTimestamp();
        const filename = `${formName}_${timestamp}.xlsx`;

        // Headers
        const headerRow: string[] = [];
        for (let c = 0; c < tableData.cols; c++) {
            headerRow.push(tableData.headers?.[c] || `Colonne ${c+1}`);
        }
        excelData.push(["Formulaire:", formName]);
        excelData.push(["Date:", timestamp]);
        excelData.push([]); // spacer
        
        // Data Rows
        const dataHeader = ['Ligne', 'Colonne', 'Contexte', 'Réponse'];
        excelData.push(dataHeader);

        for (let r = 0; r < tableData.rows; r++) {
            for (let c = 0; c < tableData.cols; c++) {
                const key = getCellKey(r, c);
                const cellData = tableData.data[key];
                 if (cellData?.merged) continue;

                const filledContent = filledData[key] || '';
                if (!filledContent) continue;
                
                const rowToAdd = [
                    `Ligne ${r + 1}`,
                    tableData.headers?.[c] || `Colonne ${c+1}`,
                    cellData?.content || 'N/A',
                    filledContent
                ];
                excelData.push(rowToAdd);
            }
        }

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        const colWidths = [ {wch: 15}, {wch: 20}, {wch: 40}, {wch: 50} ];
        worksheet['!cols'] = colWidths;
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses Formulaire');
        XLSX.writeFile(workbook, filename);
    } catch (e) {
        console.error(e);
        toast({ title: "Erreur Excel", description: "La génération du fichier Excel a échoué.", variant: "destructive"});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Remplir le formulaire: {formName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6">
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${tableData.cols}, 1fr)` }}>
            {Array.from({ length: tableData.rows }).map((_, r) =>
              Array.from({ length: tableData.cols }).map((_, c) => {
                const key = getCellKey(r, c);
                const cellData = tableData.data[key];
                if (cellData?.merged) return null;
                
                return (
                  <div 
                    key={key} 
                    className="flex flex-col gap-2 p-2 border rounded-md"
                    style={{ gridColumn: `span ${cellData?.colspan || 1}`, gridRow: `span ${cellData?.rowspan || 1}` }}
                  >
                    <label className="text-sm font-medium text-slate-700">{tableData.headers?.[c] || `Colonne ${c+1}`}</label>
                    {cellData?.content && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-md">Contexte: {cellData.content}</p>}
                    <Textarea
                      placeholder="Votre réponse..."
                      value={filledData[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="h-24"
                    />
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={exportToPDF}><Download className="mr-2 h-4 w-4" /> Télécharger PDF</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={exportToExcel}><Download className="mr-2 h-4 w-4" /> Télécharger Excel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

