"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle } from 'lucide-react';

type Row = Record<string, string>;

interface DynamicTableProps {
  onDataChange?: (data: Row[]) => void;
  initialData?: Row[];
}

export default function DynamicTable({ onDataChange, initialData }: DynamicTableProps) {
  const getInitialHeaders = () => {
      if (initialData && initialData.length > 0 && Object.keys(initialData[0]).length > 0) {
          return Object.keys(initialData[0]);
      }
      return ['Étape', 'Tâche', 'Durée'];
  };

  const getInitialRows = () => {
    if (initialData && initialData.length > 0) {
        return initialData;
    }
    return [{ 'Étape': '1', 'Tâche': 'Inspection initiale', 'Durée': '10 min' }];
  };
  
  const [headers, setHeaders] = useState<string[]>(getInitialHeaders());
  const [rows, setRows] = useState<Row[]>(getInitialRows());

  useEffect(() => {
    // Filter out rows where all cell values are empty strings
    const nonEmptyRows = rows.filter(row => 
      Object.values(row).some(cell => cell?.trim() !== '')
    );
    onDataChange?.(nonEmptyRows);
  }, [rows, headers, onDataChange]);

  const addRow = () => {
    const newRow: Row = {};
    headers.forEach(header => {
      newRow[header] = '';
    });
    setRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };
  
  const handleCellChange = (index: number, header: string, value: string) => {
    const newRows = [...rows];
    newRows[index][header] = value;
    setRows(newRows);
  };
  
  const handleHeaderChange = (oldHeader: string, newHeader: string) => {
    if (newHeader && newHeader.trim() && !headers.includes(newHeader)) {
        const newHeaders = headers.map(h => (h === oldHeader ? newHeader : h));
        setHeaders(newHeaders);

        const newRows = rows.map(row => {
            const { [oldHeader]: value, ...rest } = row;
            return {
                ...rest,
                [newHeader]: value !== undefined ? value : ''
            };
        });
        setRows(newRows);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>
                  <Input 
                    defaultValue={header}
                    onBlur={(e) => handleHeaderChange(header, e.target.value)}
                    className="font-semibold border-0 focus-visible:ring-1"
                  />
                </TableHead>
              ))}
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    <Input
                      value={row[header] || ''}
                      onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                      className="border-0 focus-visible:ring-1"
                    />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Supprimer la ligne</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button type="button" variant="outline" onClick={addRow}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Ajouter une ligne
      </Button>
    </div>
  );
}
