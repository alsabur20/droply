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
        className={`relative border border-dashed rounded-lg p-10 transition-colors flex flex-col items-center justify-center text-center cursor-pointer select-none ${
          isDragging
            ? 'border-zinc-300 dark:border-zinc-300 bg-zinc-200/50 dark:bg-zinc-800/40'
            : 'border-zinc-400/60 dark:border-zinc-700/80 hover:border-zinc-600 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-950/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="space-y-1.5 pointer-events-none">
          <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Choose files
          </p>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
            or drop them here
          </p>
        </div>

        {/* Quick folder action */}
        <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-200/60 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Select folder</span>
          </button>
        </div>
      </div>

      {/* Minimalist Stats & Sublink Row */}
      <div className="flex items-center justify-between font-mono text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <div className="flex items-center gap-3">
          <span>{selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'}</span>
          <span>•</span>
          <span>{formatBytes(totalBytes)}</span>
        </div>

        {onToggleTextMode && (
          <button
            type="button"
            onClick={onToggleTextMode}
            className="hover:underline flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isTextMode ? 'Drop files instead' : 'Send text instead'}</span>
          </button>
        )}
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800/80 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 pb-1 border-b border-zinc-200 dark:border-zinc-800">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Queue</span>
            <button
              onClick={clearSelection}
              className="text-zinc-500 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-zinc-800 dark:text-zinc-300 py-0.5 group"
              >
                <div className="flex items-center gap-2 truncate max-w-[240px] sm:max-w-[320px]">
                  <File className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">{(file as any).webkitRelativePath || file.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-zinc-500">{formatBytes(file.size)}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-zinc-400 hover:text-rose-500 p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

