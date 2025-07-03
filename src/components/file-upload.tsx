"use client";

import { useState, useRef, ReactNode, ChangeEvent, useEffect } from 'react';
import { Upload, X, FileText, Paperclip, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { getFileType } from '@/lib/data';

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
}

export default function FileUpload({ onFilesChange }: FileUploadProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onFilesChange) {
      const files = previews.map(p => p.file);
      onFilesChange(files);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews]);

  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFilePreviews = Array.from(event.target.files).map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      setPreviews(prev => {
        const combined = [...prev, ...newFilePreviews];
        // Remove duplicates
        return combined.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
      });
      
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeFile = (idToRemove: string) => {
    setPreviews(prev => {
        const fileToRemove = prev.find(f => f.id === idToRemove);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        return prev.filter(f => f.id !== idToRemove);
    });
  };
  
  const renderPreview = (file: File, previewUrl: string): ReactNode => {
    const type = getFileType(file);
    switch (type) {
      case 'image':
        return <Image src={previewUrl} alt={file.name} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />;
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
      default:
        return <Paperclip className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <Input 
        id="file-upload" 
        type="file" 
        multiple 
        ref={inputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      />
      <div
        className="flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors border-input"
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Cliquez pour sélectionner des fichiers ou glissez-déposez
          </p>
          <p className="text-xs text-muted-foreground">Les images, PDF et fichiers Excel sont pris en charge</p>
        </div>
      </div>
      
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((p) => (
            <div key={p.id} className="relative group border rounded-lg p-2 flex flex-col items-center justify-center gap-2 aspect-square">
              <div className="flex-grow flex items-center justify-center">
                {renderPreview(p.file, p.previewUrl)}
              </div>
              <span className="text-xs text-center break-all w-full truncate">{p.file.name}</span>
              <Button 
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); removeFile(p.id); }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Supprimer le fichier</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
