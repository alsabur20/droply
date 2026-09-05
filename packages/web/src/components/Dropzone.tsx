import React, { useRef, useState } from 'react';
import { UploadCloud, Folder, File, X } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function Dropzone({ onFilesSelected, disabled }: DropzoneProps) {
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full">
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

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          Drag & drop files or folders here
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Files are encrypted end-to-end directly on your device before transfer.
        </p>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/60 transition-all shadow-sm"
          >
            <File className="w-4 h-4 text-emerald-400" />
            Select Files
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/60 transition-all shadow-sm"
          >
            <Folder className="w-4 h-4 text-cyan-400" />
            Select Folder
          </button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Items ({selectedFiles.length} files • {formatBytes(totalBytes)})
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-sm">
            {selectedFiles.slice(0, 5).map((file, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/40">
                <span className="truncate max-w-[280px]">{(file as any).webkitRelativePath || file.name}</span>
                <span className="text-xs text-slate-500">{formatBytes(file.size)}</span>
              </div>
            ))}
            {selectedFiles.length > 5 && (
              <p className="text-xs text-slate-500 pt-1">
                + {selectedFiles.length - 5} more file(s)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
