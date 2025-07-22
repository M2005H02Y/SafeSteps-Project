
"use client";

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, TableData, logAnalyticsEvent, ContentBlock } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Download, Loader2, FileArchive, FileText, Table, Pilcrow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from './ui/input';
import OcpLogo from '@/app/ocplogo.png';

interface FillableFormModalProps {
  form: Form;
  isOpen: boolean;
  onClose: () => void;
}

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function FillableFormModal({ form, isOpen, onClose }: FillableFormModalProps) {
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
      setFilledData({});
    }
  }, [isOpen]);

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
    const printableElement = document.getElementById('printable-form-container');
    if (!printableElement) return null;

    try {
        const canvas = await html2canvas(printableElement, { 
            scale: 2, 
            useCORS: true, 
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ 
            orientation: 'p',
            unit: 'px', 
            format: 'a4' 
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        return pdf.output('blob');
    } catch (e) {
        console.error("PDF generation failed:", e);
        return null;
    }
  };


  const generateExcelBlob = (): Blob | null => {
    try {
      const workbook = XLSX.utils.book_new();
      let paragraphCount = 0;
      let tableCount = 0;

      form.content_blocks?.forEach((block, blockIndex) => {
        if (block.type === 'paragraph' && block.template) {
          paragraphCount++;
          const cleanHtml = block.template.replace(/<[^>]+>/g, (match) => match === '<br>' ? '\n' : ' ').replace(/&nbsp;/g, ' ');
          
          const paraAoa: (string | undefined)[][] = [["Champ", "Réponse"]];
          
          let matchIndex = 0;
          cleanHtml.replace(/\[.*?\]/g, (match) => {
              const fieldName = match.slice(1, -1);
              const uniqueKey = `p-${block.id}-${fieldName.replace(/\s+/g, '_')}-${matchIndex}`;
              paraAoa.push([fieldName, filledData[uniqueKey] || '']);
              matchIndex++;
              return match;
          });

          paraAoa.push(['---', '---']);
          paraAoa.push(['Contenu complet', cleanHtml]);

          const paraWorksheet = XLSX.utils.aoa_to_sheet(paraAoa);
          paraWorksheet['!cols'] = [{ wch: 30 }, { wch: 60 }];
          XLSX.utils.book_append_sheet(workbook, paraWorksheet, `Paragraphe ${paragraphCount}`);
        }

        if (block.type === 'table' && block.data) {
          tableCount++;
          const tableData = block.data;
          const tableAoa: (string | null)[][] = [];
          const merges = [];
      
          for (let r = 0; r < tableData.rows; r++) {
            const rowData: (string | null)[] = [];
            for (let c = 0; c < tableData.cols; c++) {
              const key = getCellKey(r, c);
              const cell = tableData.data[key];
      
              if (cell?.merged) {
                rowData.push(null);
                continue;
              }
              
              const uniqueKey = `t-${block.id}-${key}`;
              const originalContent = cell?.content || '';
              const filledContent = filledData[uniqueKey] || '';
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
            tableAoa.push(rowData);
          }
      
          const tableWorksheet = XLSX.utils.aoa_to_sheet(tableAoa);
          tableWorksheet['!merges'] = merges;
          
          const colWidths = Array.from({ length: tableData.cols }).map((_, c) => {
            let max_width = 0;
            for (let r = 0; r < tableAoa.length; r++) {
                if (tableAoa[r] && tableAoa[r][c]) {
                    const cell_length = tableAoa[r][c]!.split('\n')[0].length;
                    if (cell_length > max_width) {
                        max_width = cell_length;
                    }
                }
            }
            return { wch: Math.min(max_width + 2, 60) };
          });
          tableWorksheet['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(workbook, tableWorksheet, `Tableau ${tableCount}`);
        }
      });

      if (workbook.SheetNames.length === 0) {
        const defaultSheet = XLSX.utils.aoa_to_sheet([["Aucune donnée à exporter."]]);
        XLSX.utils.book_append_sheet(workbook, defaultSheet, 'Vide');
      }

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

  const renderGridCell = (block: ContentBlock, r: number, c: number) => {
    if (!block.data) return null;
    const key = getCellKey(r, c);
    const cellData = block.data.data[key];
    if (cellData?.merged) return null;

    const uniqueKey = `t-${block.id}-${key}`;

    if (cellData?.isHeader) {
      return (
        <div
          key={uniqueKey}
          className="flex flex-col gap-2 p-3 border rounded-lg bg-slate-200 justify-center items-center"
          style={{ gridColumn: `span ${cellData?.colspan || 1}`, gridRow: `span ${cellData?.rowspan || 1}` }}
        >
          <Label className="text-base font-semibold text-slate-900 text-center">{cellData?.content}</Label>
        </div>
      );
    }

    return (
      <div 
        key={uniqueKey} 
        className="flex flex-col gap-2 p-3 border rounded-lg bg-slate-50"
        style={{ gridColumn: `span ${cellData?.colspan || 1}`, gridRow: `span ${cellData?.rowspan || 1}` }}
      >
        <Label className="text-sm font-medium text-slate-800">{cellData?.content || ''}</Label>
        <Textarea
          placeholder="Votre réponse..."
          value={filledData[uniqueKey] || ''}
          onChange={(e) => handleInputChange(uniqueKey, e.target.value)}
          className="h-24 bg-white"
        />
      </div>
    );
  };

  const renderParagraphFields = (block: ContentBlock) => {
    if (!block.template) return null;

    const parts: (string | { fieldName: string; uniqueKey: string })[] = [];
    let lastIndex = 0;
    let matchIndex = 0;

    block.template.replace(/(\[([^\]]+)\])/g, (match, field, fieldName, offset) => {
      if (offset > lastIndex) {
        parts.push(block.template.substring(lastIndex, offset));
      }
      const uniqueKey = `p-${block.id}-${fieldName.replace(/\s+/g, '_')}-${matchIndex}`;
      parts.push({ fieldName, uniqueKey });
      lastIndex = offset + field.length;
      matchIndex++;
      return match;
    });

    if (lastIndex < block.template.length) {
      parts.push(block.template.substring(lastIndex));
    }
    
    return (
      <div className="prose prose-sm max-w-none text-base">
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
          }
          return (
            <span key={part.uniqueKey} className="inline-block mx-1">
              <Input
                id={part.uniqueKey}
                value={filledData[part.uniqueKey] || ''}
                onChange={(e) => handleInputChange(part.uniqueKey, e.target.value)}
                placeholder={part.fieldName}
                className="bg-white text-base h-8 inline-block w-auto min-w-[150px] align-baseline"
              />
            </span>
          );
        })}
      </div>
    );
  };
  
  const metadataItems = [
    { label: "Référence", value: form.reference },
    { label: "Édition", value: form.edition },
    { label: "Date d'émission", value: form.issue_date ? format(new Date(form.issue_date + 'T00:00:00Z'), "dd MMMM yyyy", { locale: fr }) : null },
    { label: "Pages", value: form.page_count },
  ].filter(item => item.value);

  const renderFilledParagraphForPdf = (block: ContentBlock) => {
    if (!block.template) return null;

    let filledHtml = block.template;
    let matchIndex = 0;

    filledHtml = filledHtml.replace(/(\[([^\]]+)\])/g, (match, field, fieldName) => {
      const uniqueKey = `p-${block.id}-${fieldName.replace(/\s+/g, '_')}-${matchIndex}`;
      const value = filledData[uniqueKey] || '__________';
      const styledValue = `<span style="display: inline-block; font-weight: bold; color: #1E40AF; border-bottom: 1px solid #9CA3AF; padding-bottom: 2px; margin-bottom: -2px;">${value}</span>`;
      matchIndex++;
      return styledValue;
    });
    
    const finalHtml = { __html: filledHtml.replace(/\n/g, '<br />') };

    return <div dangerouslySetInnerHTML={finalHtml} className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }} />;
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Remplir le formulaire: {form.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6">
            <div className="space-y-6 pr-6">
              {form.content_blocks?.map(block => (
                <div key={block.id}>
                  {block.type === 'paragraph' && (
                    <div className="p-4 border rounded-lg bg-slate-100 space-y-4">
                       <h3 className="font-semibold text-lg flex items-center gap-2"><Pilcrow className="h-5 w-5 text-primary"/> Paragraphe</h3>
                      {renderParagraphFields(block)}
                    </div>
                  )}
                  {block.type === 'table' && block.data && (
                    <div className="p-4 border rounded-lg bg-slate-100 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2"><Table className="h-5 w-5 text-primary"/> Tableau</h3>
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${block.data.cols}, 1fr)` }}>
                        {Array.from({ length: block.data.rows }).map((_, r) =>
                          Array.from({ length: block.data.cols }).map((_, c) => renderGridCell(block, r, c))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
        </DialogContent>
      </Dialog>
      {/* Hidden printable element for PDF generation */}
      <div className="absolute -left-[9999px] top-0 w-[1200px]" aria-hidden="true">
            <div id="printable-form-container" className="p-12 bg-white text-black" style={{ fontFamily: 'Times, "Times New Roman", serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '16px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', margin: 0 }}>{form.name}</h1>
                    <img src={OcpLogo.src} alt="Logo" style={{ width: '100px', height: 'auto' }} />
                </div>
                
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '16px', color: 'black', display: 'flex', flexWrap: 'wrap', gap: '24px', paddingBottom: '12px' }}>
                        {metadataItems.map(item => (
                            <div key={item.label}>
                                <span style={{fontWeight: 'bold'}}>{item.label}:</span> {item.value}
                            </div>
                        ))}
                    </div>
                    <div style={{ borderBottom: '1px solid black', paddingTop: '4px' }}></div>
                    <div style={{ paddingTop: '8px', textAlign: 'right' }}>
                        <p style={{ fontSize: '16px', color: 'black', margin: 0 }}>Rempli le: {generateTimestamp().replace('_', ' à ')}</p>
                    </div>
                </div>

                <div className="space-y-8 mt-8">
                  {form.content_blocks?.map(block => (
                    <div key={`pdf-${block.id}`}>
                      {block.type === 'paragraph' && (
                        <div>
                          {renderFilledParagraphForPdf(block)}
                        </div>
                      )}

                      {block.type === 'table' && block.data && (
                        <div style={{marginTop: '24px'}}>
                          <table style={{ borderCollapse: 'collapse', width: '100%', color: 'black', fontSize: '11px' }}>
                              <tbody>
                                  {Array.from({ length: block.data.rows }).map((_, r) => (
                                      <tr key={`r-${r}`}>
                                          {Array.from({ length: block.data.cols }).map((_, c) => {
                                              const key = getCellKey(r, c);
                                              const cell = block.data!.data[key];
                                              if (cell?.merged) return null;

                                              const uniqueKey = `t-${block.id}-${key}`;
                                              const originalContent = cell?.content || '';
                                              const filledContent = filledData[uniqueKey] || '';
                                              
                                              const CellComponent = cell?.isHeader ? 'th' : 'td';
                                              const cellStyle: React.CSSProperties = {
                                                border: '1px solid black',
                                                padding: '6px',
                                                verticalAlign: 'top',
                                                backgroundColor: cell?.isHeader ? '#E2E8F0' : '#FFFFFF',
                                                textAlign: 'left'
                                              };

                                              return (
                                                  <CellComponent
                                                      key={key}
                                                      colSpan={cell?.colspan || 1}
                                                      rowSpan={cell?.rowspan || 1}
                                                      style={cellStyle}
                                                  >
                                                      <div style={{fontWeight: cell?.isHeader ? 'bold' : 'normal', whiteSpace: 'pre-wrap'}}>{originalContent}</div>
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
                      )}
                    </div>
                  ))}
                </div>
            </div>
      </div>
    </>
  );
}
