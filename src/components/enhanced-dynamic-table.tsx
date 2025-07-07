
"use client";

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, RotateCcw, Merge, Split, Trash2, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableData, CellData } from '@/lib/data';

interface EnhancedDynamicTableProps {
  initialData?: TableData;
}

const getCellKey = (row: number, col: number) => `${row}-${col}`;

const EnhancedDynamicTable = forwardRef(({ initialData }: EnhancedDynamicTableProps, ref) => {
  const { toast } = useToast();
  
  const [history, setHistory] = useState<TableData[]>([
    initialData || { rows: 3, cols: 3, data: {}, headers: [] }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const tableState = history[historyIndex];

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const updateTableState = (updater: TableData | ((prevState: TableData) => TableData)) => {
    const newHistory = history.slice(0, historyIndex + 1);
    const currentState = newHistory[newHistory.length - 1];
    const newState = typeof updater === 'function' ? updater(currentState) : updater;

    setHistory([...newHistory, newState]);
    setHistoryIndex(newHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  useImperativeHandle(ref, () => ({
    getTableData: () => {
      const cleanedData: Record<string, CellData> = {};
      for (let r = 0; r < tableState.rows; r++) {
        for (let c = 0; c < tableState.cols; c++) {
          const key = getCellKey(r, c);
          if (tableState.data[key]) {
            cleanedData[key] = tableState.data[key];
          }
        }
      }
      return { ...tableState, data: cleanedData, headers: tableState.headers?.slice(0, tableState.cols) };
    }
  }));

  const updateCellData = (row: number, col: number, newCellData: Partial<CellData>) => {
    const key = getCellKey(row, col);
    updateTableState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: { ...(prev.data[key] || { content: '' }), ...newCellData },
      },
    }));
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

  const addRow = (atIndex: number) => {
    const { rows, cols, data, headers } = tableState;
    const newRows = rows + 1;
    const newData: Record<string, CellData> = {};

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const oldKey = getCellKey(r, c);
            if (data[oldKey]) {
                const newR = r >= atIndex ? r + 1 : r;
                const newKey = getCellKey(newR, c);
                let newCell = { ...data[oldKey] };

                if (r < atIndex && newCell.rowspan && (r + newCell.rowspan > atIndex)) {
                    newCell.rowspan++;
                }
                newData[newKey] = newCell;
            }
        }
    }
    
    updateTableState({ rows: newRows, cols, data: newData, headers });
  };
  
  const deleteRow = (atIndex: number) => {
    const { rows, cols, headers, data } = tableState;

    if (rows <= 1) {
      toast({ title: "Impossible de supprimer", description: "Le tableau doit contenir au moins une ligne.", variant: "destructive" });
      return;
    }
    const newRows = rows - 1;
    let newData: Record<string, CellData> = {};

    // Copy cells to new positions, adjusting for the deleted row
    for (let r = 0; r < rows; r++) {
      if (r === atIndex) continue;
      const newR = r > atIndex ? r - 1 : r;
      for (let c = 0; c < cols; c++) {
        const oldKey = getCellKey(r, c);
        const newKey = getCellKey(newR, c);
        if (data[oldKey]) {
            newData[newKey] = { ...data[oldKey] };
        }
      }
    }

    // Adjust rowspans of cells that spanned across the deleted row
    for (let r = 0; r < atIndex; r++) {
      for (let c = 0; c < cols; c++) {
        const key = getCellKey(r, c);
        const cell = newData[key];
        if (cell && !cell.merged && cell.rowspan && (r + cell.rowspan > atIndex)) {
          newData[key] = { ...cell, rowspan: cell.rowspan - 1 };
        }
      }
    }

    // Unmerge cells that might have been part of a deleted merged area
    for (let c = 0; c < cols; c++) {
        const key = getCellKey(atIndex, c);
        const cell = data[key];
        if (cell?.merged) {
            // Find the master cell for this merged area
            let masterR = atIndex;
            let masterC = c;
            let found = false;
            while(masterR >= 0 && !found) {
                masterC = c;
                while(masterC >=0 && !found) {
                    const masterKey = getCellKey(masterR, masterC);
                    const masterCell = data[masterKey];
                    if (masterCell && !masterCell.merged && (masterR + (masterCell.rowspan || 1) > atIndex) && (masterC + (masterCell.colspan || 1) > c)) {
                        found = true;
                    } else {
                        masterC--;
                    }
                }
                if(!found) masterR--;
            }

            if(found) {
                const masterKey = getCellKey(masterR, masterC);
                const newMasterKey = getCellKey(masterR > atIndex ? masterR - 1 : masterR, masterC);
                const newMasterCell = {...newData[newMasterKey]};
                if (newMasterCell.rowspan) {
                    newMasterCell.rowspan--;
                }
                newData[newMasterKey] = newMasterCell;
            }
        }
    }

    const finalData = { ...newData };
    for (const key in finalData) {
      const cell = finalData[key];
      if (cell && !cell.merged) {
        const [rStr, cStr] = key.split('-');
        const r = parseInt(rStr);
        const c = parseInt(cStr);
        const rowspan = cell.rowspan || 1;
        const colspan = cell.colspan || 1;
        for (let i = 0; i < rowspan; i++) {
          for (let j = 0; j < colspan; j++) {
            if (i === 0 && j === 0) continue;
            const mergedKey = getCellKey(r + i, c + j);
            finalData[mergedKey] = { ...(finalData[mergedKey] || {}), content: '', merged: true };
          }
        }
      }
    }

    updateTableState({ rows: newRows, cols, data: finalData, headers });
  };
  
  const addCol = (atIndex: number) => {
    const { rows, cols, data, headers } = tableState;
    const newCols = cols + 1;
    const newData: Record<string, CellData> = {};
    const newHeaders = [...(headers || [])];
    newHeaders.splice(atIndex, 0, '');

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const oldKey = getCellKey(r, c);
            if(data[oldKey]) {
                const newC = c >= atIndex ? c + 1 : c;
                const newKey = getCellKey(r, newC);
                let newCell = { ...data[oldKey] };

                if(c < atIndex && newCell.colspan && (c + newCell.colspan > atIndex)) {
                    newCell.colspan++;
                }
                newData[newKey] = newCell;
            }
        }
    }

    updateTableState({ rows, cols: newCols, data: newData, headers: newHeaders });
  };

  const deleteCol = (atIndex: number) => {
    const { rows, cols, data, headers } = tableState;

    if (cols <= 1) {
        toast({ title: "Impossible de supprimer", description: "Le tableau doit contenir au moins une colonne.", variant: "destructive" });
        return;
    }
    const newCols = cols - 1;
    let newData: Record<string, CellData> = {};
    const newHeaders = (headers || []).filter((_, i) => i !== atIndex);
    
    // Copy cells to new positions, adjusting for the deleted column
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c === atIndex) continue;
        const newC = c > atIndex ? c - 1 : c;
        const oldKey = getCellKey(r, c);
        const newKey = getCellKey(r, newC);
         if (data[oldKey]) {
            newData[newKey] = { ...data[oldKey] };
        }
      }
    }

    // Adjust colspans of cells that spanned across the deleted column
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < atIndex; c++) {
        const key = getCellKey(r, c);
        const cell = newData[key];
        if (cell && !cell.merged && cell.colspan && (c + cell.colspan > atIndex)) {
          newData[key] = { ...cell, colspan: cell.colspan - 1 };
        }
      }
    }

    // Unmerge cells that might have been part of a deleted merged area
    for (let r = 0; r < rows; r++) {
        const key = getCellKey(r, atIndex);
        const cell = data[key];
        if (cell?.merged) {
             let masterR = r;
            let masterC = atIndex;
            let found = false;
            while(masterR >= 0 && !found) {
                masterC = atIndex;
                while(masterC >=0 && !found) {
                    const masterKey = getCellKey(masterR, masterC);
                    const masterCell = data[masterKey];
                    if (masterCell && !masterCell.merged && (masterR + (masterCell.rowspan || 1) > r) && (masterC + (masterCell.colspan || 1) > atIndex)) {
                        found = true;
                    } else {
                        masterC--;
                    }
                }
                if(!found) masterR--;
            }
            if(found) {
                const masterKey = getCellKey(masterR, masterC);
                const newMasterKey = getCellKey(masterR, masterC > atIndex ? masterC - 1 : masterC);
                const newMasterCell = {...newData[newMasterKey]};
                if (newMasterCell.colspan) {
                    newMasterCell.colspan--;
                }
                newData[newMasterKey] = newMasterCell;
            }
        }
    }
    
    const finalData = { ...newData };
    for (const key in finalData) {
      const cell = finalData[key];
      if (cell && !cell.merged) {
        const [rStr, cStr] = key.split('-');
        const r = parseInt(rStr);
        const c = parseInt(cStr);
        const rowspan = cell.rowspan || 1;
        const colspan = cell.colspan || 1;
        for (let i = 0; i < rowspan; i++) {
          for (let j = 0; j < colspan; j++) {
            if (i === 0 && j === 0) continue;
            const mergedKey = getCellKey(r + i, c + j);
            finalData[mergedKey] = { ...(finalData[mergedKey] || {}), content: '', merged: true };
          }
        }
      }
    }
    updateTableState({ rows, cols: newCols, data: finalData, headers: newHeaders });
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
        }

        if (r === minRow && c === minCol) {
          newData[key] = { ...(newData[key] || {content: ''}), content: mergedContent.trim(), colspan, rowspan, merged: false };
        } else {
          newData[key] = { ...(newData[key] || {content: ''}), merged: true, content: '' };
        }
      }
    }
    updateTableState(prev => ({ ...prev, data: newData }));
    setSelectedCells(new Set([getCellKey(minRow, minCol)]));
  };
  
  const splitCell = (row: number, col: number) => {
    const key = getCellKey(row, col);
    const cell = tableState.data[key];
    if (!cell || (!cell.colspan && !cell.rowspan)) {
      toast({ title: "Cette cellule n'est pas fusionnée.", variant: "destructive" });
      return;
    }

    const { colspan = 1, rowspan = 1 } = cell;
    const newData = { ...tableState.data };
    const newSelected = new Set<string>();

    for (let r = row; r < row + rowspan; r++) {
      for (let c = col; c < col + colspan; c++) {
        const currentKey = getCellKey(r, c);
        const currentCell = { ...(newData[currentKey] || {}) };
        
        delete currentCell.colspan;
        delete currentCell.rowspan;
        delete currentCell.merged;
        
        newData[currentKey] = currentCell;
        newSelected.add(currentKey);
      }
    }
    
    updateTableState(prev => ({...prev, data: newData}));
    setSelectedCells(newSelected);
    toast({ title: "Cellules défusionnées", description: "La cellule a été divisée avec succès." });
  };

  const renderCell = (r: number, c: number) => {
    const key = getCellKey(r, c);
    const cell = tableState.data[key];
    if (cell?.merged) return null;

    const showSplitButton = (cell?.colspan && cell.colspan > 1) || (cell?.rowspan && cell.rowspan > 1);

    return (
      <td
        key={key}
        colSpan={cell?.colspan}
        rowSpan={cell?.rowspan}
        className={cn(
          "border border-slate-300 p-1 relative min-h-[60px] align-top group",
          selectedCells.has(key) ? "bg-blue-100 ring-2 ring-blue-500 z-10" : "bg-white hover:bg-slate-50"
        )}
        onClick={(e) => handleCellClick(r, c, e)}
      >
        <textarea
            placeholder="Contenu..."
            className="w-full text-xs p-1 border-none focus:ring-0 resize-none bg-transparent h-full"
            value={cell?.content || ''}
            onChange={(e) => updateCellData(r, c, { content: e.target.value })}
            rows={2}
        />
        <div className="absolute bottom-1 right-1 flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
            {showSplitButton && <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); splitCell(r,c); }}><Split className="h-4 w-4"/></Button>}
        </div>
      </td>
    );
  };
  
  const resetTable = () => {
    updateTableState({ rows: 3, cols: 3, data: {}, headers: [] });
    setSelectedCells(new Set());
  }
  
  const handleHeaderChange = (index: number, value: string) => {
      updateTableState(prev => {
        const newHeaders = [...(prev.headers || [])];
        newHeaders[index] = value;
        return {...prev, headers: newHeaders};
      });
  }

  return (
    <div>
        <div className="controls p-2 bg-slate-50 rounded-lg border flex flex-wrap items-center gap-4 mb-4">
            <Button type="button" variant="outline" onClick={handleUndo} disabled={historyIndex === 0}>
                <Undo2 className="mr-2 h-4 w-4"/>
                Annuler
            </Button>
            <Button type="button" variant="outline" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="mr-2 h-4 w-4"/>
                Rétablir
            </Button>
            <Button type="button" variant="outline" onClick={mergeCells} disabled={selectedCells.size < 2}><Merge className="mr-2 h-4 w-4"/>Fusionner</Button>
            <Button type="button" variant="outline" onClick={resetTable}><RotateCcw className="mr-2 h-4 w-4"/>Réinitialiser</Button>
        </div>

        <div className="relative overflow-auto p-4 bg-slate-100/50 rounded-lg">
            <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr className="group">
                        <th className="border-b border-r border-slate-300 bg-slate-100 w-[40px] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-md" onClick={() => addRow(0)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-md" onClick={() => addCol(0)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        </th>
                        {[...Array(tableState.cols)].map((_, c) => (
                            <th key={c} className="border-b border-r border-slate-300 p-1 bg-slate-100 relative group/col">
                                <Input
                                    placeholder={`Col ${c + 1}`}
                                    className="text-sm font-bold border-none bg-transparent focus:ring-0 text-center"
                                    value={tableState.headers?.[c] || ''}
                                    onChange={(e) => handleHeaderChange(c, e.target.value)}
                                />
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/col:opacity-100 transition-opacity">
                                    <Button type="button" size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => deleteCol(c)}>
                                        <Trash2 className="h-3 w-3"/>
                                    </Button>
                                </div>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/col:opacity-100 transition-opacity">
                                    <Button type="button" size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-md" onClick={() => addCol(c + 1)}>
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(tableState.rows)].map((_, r) => (
                        <tr key={r} className="group/row">
                            <td className="border-r border-b border-slate-300 bg-slate-100 w-[40px] relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <Button type="button" size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => deleteRow(r)}>
                                        <Trash2 className="h-3 w-3"/>
                                    </Button>
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <Button type="button" size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-md" onClick={() => addRow(r + 1)}>
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </td>
                            {[...Array(tableState.cols)].map((_, c) => renderCell(r, c))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
});

EnhancedDynamicTable.displayName = "EnhancedDynamicTable";

export default EnhancedDynamicTable;
