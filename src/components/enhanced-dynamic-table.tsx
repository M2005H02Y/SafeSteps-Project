
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Upload, Save, RotateCcw, Image as ImageIcon, Trash2, Merge, Split, GripVertical, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableData, CellData } from '@/lib/data';

interface EnhancedDynamicTableProps {
  initialData?: TableData;
  onDataChange: (data: TableData) => void;
}

const getCellKey = (row: number, col: number) => `${row}-${col}`;

export default function EnhancedDynamicTable({ initialData, onDataChange }: EnhancedDynamicTableProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tableState, setTableState] = useState<TableData>(
    initialData || { rows: 3, cols: 3, data: {}, headers: [] }
  );
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [draggedCellKey, setDraggedCellKey] = useState<string | null>(null);

  useEffect(() => {
    onDataChange(tableState);
  }, [tableState, onDataChange]);

  const updateCell = (row: number, col: number, newCellData: Partial<CellData>) => {
    const key = getCellKey(row, col);
    setTableState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: { ...prev.data[key], ...newCellData },
      },
    }));
  };

  const handleRowsChange = (amount: number) => {
    const newRows = Math.max(1, tableState.rows + amount);
    if (amount < 0 && newRows < tableState.rows) {
        // Clear data from deleted rows
        const newData = { ...tableState.data };
        for (let r = newRows; r < tableState.rows; r++) {
            for (let c = 0; c < tableState.cols; c++) {
                delete newData[getCellKey(r, c)];
            }
        }
        setTableState(prev => ({ ...prev, rows: newRows, data: newData }));
    } else {
        setTableState(prev => ({ ...prev, rows: newRows }));
    }
  };

  const handleColsChange = (amount: number) => {
    const newCols = Math.max(1, tableState.cols + amount);
    if (amount < 0 && newCols < tableState.cols) {
        // Clear data from deleted columns
        const newData = { ...tableState.data };
        for (let r = 0; r < tableState.rows; r++) {
            for (let c = newCols; c < tableState.cols; c++) {
                delete newData[getCellKey(r, c)];
            }
        }
        setTableState(prev => ({ ...prev, cols: newCols, data: newData }));
    } else {
        setTableState(prev => ({ ...prev, cols: newCols }));
    }
  };
  
  const handleCellClick = (row: number, col: number, event: React.MouseEvent) => {
    const key = getCellKey(row, col);
    if (event.ctrlKey || event.metaKey) {
      setSelectedCells(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(key)) {
          newSelection.delete(key);
        } else {
          newSelection.add(key);
        }
        return newSelection;
      });
    } else {
      setSelectedCells(new Set([key]));
    }
  };

  const mergeCells = () => {
    if (selectedCells.size < 2) {
      toast({ title: "Sélectionnez au moins 2 cellules à fusionner.", variant: "destructive" });
      return;
    }
    
    const positions = Array.from(selectedCells).map(key => ({
      row: parseInt(key.split('-')[0]),
      col: parseInt(key.split('-')[1]),
    }));

    const minRow = Math.min(...positions.map(p => p.row));
    const maxRow = Math.max(...positions.map(p => p.row));
    const minCol = Math.min(...positions.map(p => p.col));
    const maxCol = Math.max(...positions.map(p => p.col));

    const colspan = maxCol - minCol + 1;
    const rowspan = maxRow - minRow + 1;

    let mergedContent = '';
    let mergedImage: string | undefined;

    const newData = { ...tableState.data };

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const key = getCellKey(r, c);
        if (!selectedCells.has(key)) {
          toast({ title: "La sélection doit former un rectangle pour la fusion.", variant: "destructive" });
          return;
        }

        const cell = newData[key];
        if (cell) {
          if (cell.content) mergedContent += cell.content + ' ';
          if (cell.image && !mergedImage) mergedImage = cell.image;
        }

        if (r === minRow && c === minCol) {
          newData[key] = { ...cell, content: mergedContent.trim(), image: mergedImage, colspan, rowspan };
        } else {
          newData[key] = { ...cell, merged: true, content: '', image: undefined };
        }
      }
    }
    setTableState(prev => ({ ...prev, data: newData }));
    setSelectedCells(new Set([getCellKey(minRow, minCol)]));
  };
  
  const splitCell = (row: number, col: number) => {
    const key = getCellKey(row, col);
    const cell = tableState.data[key];
    if (!cell || (!cell.colspan && !cell.rowspan)) return;

    const { colspan = 1, rowspan = 1 } = cell;
    const newData = { ...tableState.data };
    
    newData[key] = { ...cell, colspan: 1, rowspan: 1 };

    for (let r = row; r < row + rowspan; r++) {
      for (let c = col; c < col + colspan; c++) {
        if (r === row && c === col) continue;
        const currentKey = getCellKey(r, c);
        const currentCell = newData[currentKey] || {};
        delete currentCell.merged;
        newData[currentKey] = currentCell;
      }
    }
    setTableState(prev => ({...prev, data: newData}));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!draggedCellKey) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const [row, col] = draggedCellKey.split('-').map(Number);
        updateCell(row, col, { image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    setDraggedCellKey(null);
  };

  const renderCell = (r: number, c: number) => {
    const key = getCellKey(r, c);
    const cell = tableState.data[key] || { content: '' };
    if (cell.merged) return null;

    return (
      <td
        key={key}
        colSpan={cell.colspan}
        rowSpan={cell.rowspan}
        className={cn(
          "border border-slate-300 p-1 relative min-h-[60px] align-top",
          selectedCells.has(key) ? "bg-blue-100 ring-2 ring-blue-500 z-10" : "hover:bg-slate-50"
        )}
        onClick={(e) => handleCellClick(r, c, e)}
      >
        <div className="flex flex-col h-full">
            <textarea
                placeholder="Contenu..."
                className="w-full text-xs p-1 border-none focus:ring-0 resize-none bg-transparent"
                value={cell.content || ''}
                onChange={(e) => updateCell(r, c, { content: e.target.value })}
                rows={2}
            />
            {cell.image && (
                <div className="relative mt-1">
                    <ImageIcon src={cell.image} alt="preview" width={80} height={80} className="w-full h-16 object-cover rounded border"/>
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => updateCell(r, c, { image: undefined })}><Trash2 className="h-3 w-3"/></Button>
                </div>
            )}
        </div>
        <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setDraggedCellKey(key); fileInputRef.current?.click(); }}><Upload className="h-4 w-4"/></Button>
            {cell.colspan || cell.rowspan ? <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => splitCell(r,c)}><Split className="h-4 w-4"/></Button> : null}
        </div>
      </td>
    );
  };
  
  const resetTable = () => {
    setTableState({ rows: 3, cols: 3, data: {}, headers: [] });
    setSelectedCells(new Set());
  }
  
  const handleHeaderChange = (index: number, value: string) => {
      const newHeaders = [...(tableState.headers || [])];
      newHeaders[index] = value;
      setTableState(prev => ({...prev, headers: newHeaders}));
  }

  return (
    <Card className="w-full">
      <CardHeader>
          <CardTitle>Éditeur de tableau de formulaire</CardTitle>
          <CardDescription>Concevez la structure de votre formulaire ici. Utilisez Ctrl/Cmd + Clic pour sélectionner plusieurs cellules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="controls p-4 bg-slate-50 rounded-lg border flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Lignes:</span>
            <Button size="icon" variant="outline" onClick={() => handleRowsChange(-1)}><Minus className="h-4 w-4"/></Button>
            <span className="text-sm font-bold w-6 text-center">{tableState.rows}</span>
            <Button size="icon" variant="outline" onClick={() => handleRowsChange(1)}><Plus className="h-4 w-4"/></Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Colonnes:</span>
            <Button size="icon" variant="outline" onClick={() => handleColsChange(-1)}><Minus className="h-4 w-4"/></Button>
            <span className="text-sm font-bold w-6 text-center">{tableState.cols}</span>
            <Button size="icon" variant="outline" onClick={() => handleColsChange(1)}><Plus className="h-4 w-4"/></Button>
          </div>
           <GripVertical className="text-slate-300 h-6"/>
          <Button variant="outline" onClick={mergeCells} disabled={selectedCells.size < 2}><Merge className="mr-2 h-4 w-4"/>Fusionner</Button>
          <Button variant="outline" onClick={resetTable}><RotateCcw className="mr-2 h-4 w-4"/>Réinitialiser</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {[...Array(tableState.cols)].map((_, c) => (
                  <th key={c} className="border border-slate-300 p-1 bg-slate-100">
                    <Input
                      placeholder={`Colonne ${c + 1}`}
                      className="text-sm font-bold border-none bg-transparent focus:ring-0"
                      value={tableState.headers?.[c] || ''}
                      onChange={(e) => handleHeaderChange(c, e.target.value)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(tableState.rows)].map((_, r) => (
                <tr key={r}>
                  {[...Array(tableState.cols)].map((_, c) => renderCell(r, c))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
      </CardContent>
    </Card>
  );
}

