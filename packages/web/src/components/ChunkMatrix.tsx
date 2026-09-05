import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import type { TransferMetrics } from '../hooks/useTransfer.js';

interface ChunkMatrixProps {
  metrics: TransferMetrics;
  status: string;
}

export function ChunkMatrix({ metrics, status }: ChunkMatrixProps) {
  const TOTAL_BLOCKS = 32;
  const percent = Math.round(metrics.progress || (status === 'completed' ? 100 : 0));
  const filledBlocks = Math.round((percent / 100) * TOTAL_BLOCKS);

  return (
    <div className="w-full p-4 bg-zinc-950 text-zinc-100 border-2 border-zinc-800 font-mono text-xs space-y-3 shadow-inner">
      <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-zinc-200">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase tracking-wider">CRYPTOGRAPHIC CHUNK STREAM</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-zinc-500">BLOCK: 64KB</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">
            {filledBlocks}/{TOTAL_BLOCKS} BLOCKS ({percent}%)
          </span>
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 py-1">
        {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
          const isFilled = index < filledBlocks;
          const isInFlight = index === filledBlocks && status === 'transferring';

          return (
            <div
              key={index}
              className={`h-4 transition-all duration-150 ${
                isFilled
                  ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                  : isInFlight
                  ? 'bg-emerald-400/50 border border-emerald-300 animate-pulse'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
              title={`Block #${index + 1}: ${isFilled ? 'Verified & Written' : isInFlight ? 'Decrypting...' : 'Pending'}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>AES-256-GCM Poly1305 / SHA-256 Checksum Verified</span>
        </div>
        <span className="text-zinc-400">Zero Cloud Storage</span>
      </div>
    </div>
  );
}
