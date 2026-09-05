import React, { useEffect, useState } from 'react';
import { Download, Terminal, ExternalLink } from 'lucide-react';

interface OsInfo {
  name: string;
  arch: string;
  filename: string;
  url: string;
}

const REPO_RELEASES = 'https://github.com/alsabur20/droply/releases';
const VERSION = 'v1.0.0';

export function CliBanner() {
  const [detectedOs, setDetectedOs] = useState<OsInfo>({
    name: 'Linux',
    arch: '64-bit',
    filename: 'droply-linux-x64',
    url: `${REPO_RELEASES}/download/${VERSION}/droply-linux-x64`
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('win')) {
      setDetectedOs({
        name: 'Windows',
        arch: 'x64',
        filename: 'droply-windows-x64.exe',
        url: `${REPO_RELEASES}/download/${VERSION}/droply-windows-x64.exe`
      });
    } else if (ua.includes('mac') || ua.includes('darwin')) {
      // Modern Macs default to ARM64 (Apple Silicon M1/M2/M3/M4)
      const isArm = ua.includes('arm') || ((navigator as any).userAgentData?.architecture === 'arm');
      setDetectedOs({
        name: 'macOS',
        arch: isArm ? 'Apple Silicon (arm64)' : 'Universal / Intel (x64)',
        filename: isArm ? 'droply-macos-arm64' : 'droply-macos-x64',
        url: `${REPO_RELEASES}/download/${VERSION}/${isArm ? 'droply-macos-arm64' : 'droply-macos-x64'}`
      });
    } else {
      setDetectedOs({
        name: 'Linux',
        arch: 'x64',
        filename: 'droply-linux-x64',
        url: `${REPO_RELEASES}/download/${VERSION}/droply-linux-x64`
      });
    }
  }, []);

  return (
    <div className="w-full border-2 border-zinc-300 dark:border-zinc-800 rounded-none bg-white dark:bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
      {/* Left Text */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 border border-zinc-400 dark:border-zinc-700">
            Droply CLI
          </span>
          <span className="text-[11px] text-zinc-500">v1.0.0</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
          Install droply for {detectedOs.name}.
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Via Terminal:</span>
          <code className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2 py-1 text-zinc-800 dark:text-zinc-200 select-all">
            curl -fsSL https://raw.githubusercontent.com/alsabur20/droply/main/install.sh | bash
          </code>
        </div>
      </div>

      {/* Right Download Button & Platform list */}
      <div className="flex flex-col items-start md:items-end gap-3 font-mono">
        <a
          href={detectedOs.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-3 rounded-none bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-50 dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <Download className="w-5 h-5 shrink-0" />
          <div className="text-left leading-tight">
            <div className="text-xs font-bold uppercase">Download {VERSION}</div>
            <div className="text-[11px] opacity-80">{detectedOs.name} - {detectedOs.arch}</div>
          </div>
        </a>

        {/* npm package link */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span>or:</span>
          <code className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-1.5 py-0.5 text-zinc-900 dark:text-zinc-100 select-all font-bold">
            npm i -g droply-cli
          </code>
        </div>
      </div>
    </div>
  );
}
