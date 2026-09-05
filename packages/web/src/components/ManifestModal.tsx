import React from 'react';
import { Manifest } from '@droply/protocol';
import { ShieldCheck, FileCheck, XCircle } from 'lucide-react';
import { formatBytes } from './Dropzone.js';

interface ManifestModalProps {
  manifest: Manifest;
  onAccept: () => void;
  onReject: () => void;
}

export function ManifestModal({ manifest, onAccept, onReject }: ManifestModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 rounded-none max-w-md w-full p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] space-y-5 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">Incoming Payload</h3>
            <p className="text-xs text-zinc-500">Zero-Knowledge E2EE Session Authenticated</p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-none p-4 border-2 border-zinc-300 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Payload Type:</span>
            <span className="font-bold text-zinc-950 dark:text-zinc-100 uppercase">{manifest.payloadType}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Item Count:</span>
            <span className="font-bold text-zinc-950 dark:text-zinc-100">{manifest.files.length} file(s)</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Total Payload Size:</span>
            <span className="font-black text-zinc-950 dark:text-zinc-100">{formatBytes(manifest.totalBytes)}</span>
          </div>

          <div className="pt-2 border-t border-zinc-300 dark:border-zinc-800 max-h-32 overflow-y-auto space-y-1">
            {manifest.files.slice(0, 5).map((f) => (
              <div key={f.id} className="flex justify-between items-center text-xs py-0.5 text-zinc-800 dark:text-zinc-200">
                <span className="truncate max-w-[220px] font-medium">{f.path}</span>
                <span className="text-zinc-500">{formatBytes(f.size)}</span>
              </div>
            ))}
            {manifest.files.length > 5 && (
              <p className="text-[11px] text-zinc-500 pt-0.5">
                + {manifest.files.length - 5} more file(s)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors border-2 border-zinc-400 dark:border-zinc-700"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-50 dark:text-zinc-950 font-bold text-xs transition-all border-2 border-zinc-950 dark:border-zinc-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Accept & Receive
          </button>
        </div>
      </div>
    </div>
  );
}
