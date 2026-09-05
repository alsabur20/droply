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
    <div className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">
          {statusMessage || 'Transferring...'}
        </span>
        <span className="text-zinc-950 dark:text-zinc-50 font-bold shrink-0">
          {metrics.progress.toFixed(1)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-800">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-200"
          style={{ width: `${Math.min(100, Math.max(0, metrics.progress))}%` }}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] border-t border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span>{formatSpeed(metrics.speed)}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          <span>ETA: {formatEta(metrics.eta)}</span>
        </div>

        <div className="text-right truncate font-medium text-zinc-700 dark:text-zinc-300">
          {formatBytes(metrics.bytesTransferred)} / {formatBytes(metrics.totalBytes)}
        </div>
      </div>
    </div>
  );
}
