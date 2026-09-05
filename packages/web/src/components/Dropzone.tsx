import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Folder, File, X, FileText } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  onToggleTextMode?: () => void;
  isTextMode?: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function Dropzone({
  onFilesSelected,
  disabled,
  onToggleTextMode,
  isTextMode = false
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !e.dataTransfer.files) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      onFilesSelected(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      onFilesSelected(files);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        className="hidden"
      />

      {/* Dotted Minimal Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-none p-10 transition-colors flex flex-col items-center justify-center text-center cursor-pointer select-none ${
          isDragging
            ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-200/60 dark:bg-zinc-800/60'
            : 'border-zinc-400 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 bg-zinc-50/60 dark:bg-zinc-950/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="space-y-1 pointer-events-none">
          <p className="font-mono text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            Drop files here
          </p>
          <p className="font-mono text-xs text-zinc-500">
            or click to browse local files
          </p>
        </div>

        {/* Quick folder action */}
        <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-400 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-100 transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Select Folder</span>
          </button>
        </div>
      </div>

      {/* Minimalist Stats & Sublink Row */}
      <div className="flex items-center justify-between font-mono text-xs text-zinc-600 dark:text-zinc-400 px-0.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'}</span>
          <span>/</span>
          <span>{formatBytes(totalBytes)}</span>
        </div>

        {onToggleTextMode && (
          <button
            type="button"
            onClick={onToggleTextMode}
            className="hover:underline flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isTextMode ? 'Drop files instead' : 'Send text instead'}</span>
          </button>
        )}
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="p-3.5 rounded-none bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
            <span className="uppercase text-[10px] tracking-wider font-bold text-zinc-900 dark:text-zinc-100">
              Payload Queue ({selectedFiles.length})
            </span>
            <button
              onClick={clearSelection}
              className="text-zinc-500 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((file, i) => {
              const ext = file.name.split('.').pop()?.toUpperCase() || 'BIN';
              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-zinc-800 dark:text-zinc-200 py-1 px-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 group"
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px] sm:max-w-[300px]">
                    <span className="text-[10px] font-bold px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
                      {ext.slice(0, 4)}
                    </span>
                    <span className="truncate">{(file as any).webkitRelativePath || file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-500 text-[11px]">{formatBytes(file.size)}</span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

