"use client";

import { useState, useRef, ReactNode, ChangeEvent, useEffect } from 'react';
import { Upload, X, FileText, Paperclip, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { FileAttachment, getFileType } from '@/lib/data';

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

interface FileUploadProps {
  onUploadComplete?: (files: FileAttachment[]) => void;
  initialFiles?: FileAttachment[];
}

export default function FileUpload({ onUploadComplete, initialFiles = [] }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>(initialFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
      onUploadComplete?.(uploadedFiles);
  }, [uploadedFiles, onUploadComplete]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesToUpload = Array.from(event.target.files);
      if (!cloudName || !uploadPreset) {
        console.error("Cloudinary credentials are not configured in .env.local");
        alert("Erreur de configuration: Impossible de téléverser les fichiers. Veuillez contacter un administrateur.");
        return;
      }

      const newUploadingFiles = filesToUpload.map(file => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        progress: 0,
      }));
      setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
           throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await response.json();
        
        return {
          name: data.original_filename || file.name,
          url: data.secure_url,
          type: getFileType(file),
        };
      });

      try {
        const results = await Promise.all(uploadPromises);
        const newUploadedFiles = [...uploadedFiles, ...results];
        setUploadedFiles(newUploadedFiles);
        onUploadComplete?.(newUploadedFiles);
      } catch (error) {
        console.error("Error during upload: ", error);
        alert("Une erreur est survenue lors du téléversement d'un ou plusieurs fichiers.");
      } finally {
        setUploadingFiles([]);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }
  };

  const removeFile = (urlToRemove: string) => {
    const newUploadedFiles = uploadedFiles.filter(f => f.url !== urlToRemove);
    setUploadedFiles(newUploadedFiles);
    onUploadComplete?.(newUploadedFiles);
  };
  
  const renderPreview = (file: FileAttachment): ReactNode => {
    switch (file.type) {
      case 'image':
        return <Image src={file.url} alt={file.name} width={64} height={64} className="h-16 w-16 object-cover rounded-md" />;
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
        disabled={uploadingFiles.length > 0}
      />
      <div
        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg transition-colors border-input ${uploadingFiles.length > 0 ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer hover:border-primary'}`}
        onClick={() => !(uploadingFiles.length > 0) && inputRef.current?.click()}
      >
        <div className="text-center">
          {uploadingFiles.length > 0 ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <p className="mt-2 text-sm text-muted-foreground">Téléversement en cours...</p>
              <p className="text-xs text-muted-foreground">{uploadingFiles.length} fichier(s)</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Cliquez pour sélectionner des fichiers ou glissez-déposez
              </p>
              <p className="text-xs text-muted-foreground">Les images, PDF et fichiers Excel sont pris en charge</p>
            </>
          )}
        </div>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploadedFiles.map((file) => (
            <div key={file.url} className="relative group border rounded-lg p-2 flex flex-col items-center justify-center gap-2 aspect-square">
              <div className="flex-grow flex items-center justify-center">
                {renderPreview(file)}
              </div>
              <span className="text-xs text-center break-all w-full truncate">{file.name}</span>
              <Button 
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); removeFile(file.url); }}
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
