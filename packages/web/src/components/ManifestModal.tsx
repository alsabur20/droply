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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Incoming Transfer</h3>
            <p className="text-xs text-zinc-500">Verified End-to-End Encrypted Session</p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950/80 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-500">
            <span>Payload:</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">{manifest.payloadType}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Items:</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{manifest.files.length} file(s)</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Total size:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatBytes(manifest.totalBytes)}</span>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 max-h-32 overflow-y-auto space-y-1">
            {manifest.files.slice(0, 5).map((f) => (
              <div key={f.id} className="flex justify-between items-center text-xs py-0.5 text-zinc-700 dark:text-zinc-300">
                <span className="truncate max-w-[220px]">{f.path}</span>
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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-colors border border-zinc-300 dark:border-zinc-700"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-50 dark:text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Accept & Receive
          </button>
        </div>
      </div>
    </div>
  );
}
