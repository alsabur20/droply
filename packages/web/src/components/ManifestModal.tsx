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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Incoming Transfer</h3>
            <p className="text-xs text-slate-400">Verified End-to-End Encrypted Session</p>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Payload Type:</span>
            <span className="font-semibold text-slate-200 uppercase">{manifest.payloadType}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Total Items:</span>
            <span className="font-semibold text-slate-200">{manifest.files.length} file(s)</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Total Size:</span>
            <span className="font-semibold text-emerald-400">{formatBytes(manifest.totalBytes)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 max-h-32 overflow-y-auto space-y-1">
            {manifest.files.slice(0, 5).map((f) => (
              <div key={f.id} className="flex justify-between items-center text-xs py-1 text-slate-300">
                <span className="truncate max-w-[220px]">{f.path}</span>
                <span className="text-slate-500">{formatBytes(f.size)}</span>
              </div>
            ))}
            {manifest.files.length > 5 && (
              <p className="text-[11px] text-slate-500">
                + {manifest.files.length - 5} more file(s)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all border border-slate-700/60"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/40"
          >
            <FileCheck className="w-4 h-4" />
            Accept & Download
          </button>
        </div>
      </div>
    </div>
  );
}
