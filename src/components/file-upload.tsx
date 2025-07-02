"use client";

import { useState, useRef, ReactNode, ChangeEvent } from 'react';
import { Upload, X, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface FilePreview {
  file: File;
  preview: string;
}

export default function FileUpload() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles].filter((v,i,a)=>a.findIndex(t=>(t.file.name === v.file.name))===i));
      
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };
  
  const renderPreview = (file: File, preview: string): ReactNode => {
    if (file.type.startsWith('image/')) {
      return <Image src={preview} alt={file.name} width={64} height={64} className="h-16 w-16 object-cover rounded-md" onLoad={() => URL.revokeObjectURL(preview)} />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-12 w-12 text-destructive" />;
    }
    return <Paperclip className="h-12 w-12 text-muted-foreground" />;
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
        accept="image/*,application/pdf,.xlsx,.xls"
      />
      <div
        className="flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors border-input"
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Click to select files or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">Images, PDF, and Excel files are supported</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((f, index) => (
            <div key={`${f.file.name}-${index}`} className="relative group border rounded-lg p-2 flex flex-col items-center justify-center gap-2 aspect-square">
              <div className="flex-grow flex items-center justify-center">
                {renderPreview(f.file, f.preview)}
              </div>
              <span className="text-xs text-center break-all w-full truncate">{f.file.name}</span>
              <Button 
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); removeFile(f.file); }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
