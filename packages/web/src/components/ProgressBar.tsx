import React from 'react';
import { TransferMetrics } from '../hooks/useTransfer.js';
import { formatBytes } from './Dropzone.js';
import { Activity, Clock } from 'lucide-react';

interface ProgressBarProps {
  metrics: TransferMetrics;
  statusMessage?: string;
}

export function ProgressBar({ metrics, statusMessage }: ProgressBarProps) {
  const formatSpeed = (bytesPerSec: number) => {
    return `${formatBytes(bytesPerSec)}/s`;
  };

  const formatEta = (seconds: number) => {
    if (!seconds || !isFinite(seconds) || seconds < 0) return '--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">
          {statusMessage || 'Transferring...'}
        </span>
        <span className="text-emerald-400 font-mono font-bold">
          {metrics.progress.toFixed(1)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${Math.min(100, Math.max(0, metrics.progress))}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-800/50">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{formatSpeed(metrics.speed)}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>ETA: {formatEta(metrics.eta)}</span>
        </div>

        <div className="text-right text-slate-400 truncate">
          {formatBytes(metrics.bytesTransferred)} / {formatBytes(metrics.totalBytes)}
        </div>
      </div>
    </div>
  );
}
