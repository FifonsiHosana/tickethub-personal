import React, { useState } from 'react';
import { UploadCloud, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const ACCEPTED_EXT = ['.csv', '.txt', '.xlsx'];
const MAX_SIZE = 5 * 1024 * 1024;

interface ContactImportProps {
  fileName: string | null;
  fileError: string | null;
  onFileSelect: (file: File | null) => void;
}

export const ContactImport: React.FC<ContactImportProps> = ({
  fileName,
  fileError,
  onFileSelect,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File) => {
    const lower = file.name.toLowerCase();
    if (!ACCEPTED_EXT.some((ext) => lower.endsWith(ext))) {
      onFileSelect(null);
      return 'Unsupported file type. Upload a .csv, .txt or .xlsx file.';
    }
    if (file.size > MAX_SIZE) {
      onFileSelect(null);
      return 'File is too large. Maximum size is 5MB.';
    }
    onFileSelect(file);
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateFile(file);
  };

  return (
    <div className="mt-4">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-border bg-accent/30 hover:bg-accent/50',
        )}
      >
        <UploadCloud className={cn('size-7', dragActive ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm text-foreground">Drag & drop a contact file here</p>
        <p className="text-xs text-muted-foreground">or click to browse *.csv, .txt, .xlsx (max 5MB)</p>
        <Input
          type="file"
          accept=".csv,.txt,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {fileName && !fileError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Loaded: {fileName}</span>
        </div>
      )}
    </div>
  );
};