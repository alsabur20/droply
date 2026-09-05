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
    <div className="w-full border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Left Text */}
      <div className="space-y-1.5">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
          Droply CLI
        </p>
        <h2 className="text-2xl sm:text-3xl font-mono font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
          Download droply for {detectedOs.name}.
        </h2>
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          Fast native terminal transfers without web browser overhead.
        </p>
      </div>

      {/* Right Download Button & Platform list */}
      <div className="flex flex-col items-start md:items-end gap-2.5">
        <a
          href={detectedOs.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-100 dark:text-zinc-950 font-mono transition-colors shadow-sm"
        >
          <Download className="w-5 h-5 shrink-0" />
          <div className="text-left leading-tight">
            <div className="text-xs font-bold">Download {VERSION}</div>
            <div className="text-[11px] opacity-75">{detectedOs.name} - {detectedOs.arch}</div>
          </div>
        </a>

        {/* Secondary build links */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>Other builds:</span>
          <a
            href={`${REPO_RELEASES}/download/${VERSION}/droply-linux-x64`}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700"
          >
            Linux x64
          </a>
          <span>·</span>
          <a
            href={`${REPO_RELEASES}/download/${VERSION}/droply-macos-arm64`}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700"
          >
            macOS arm64
          </a>
          <span>·</span>
          <a
            href={`${REPO_RELEASES}/download/${VERSION}/droply-macos-x64`}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700"
          >
            macOS x64
          </a>
          <span>·</span>
          <a
            href={`${REPO_RELEASES}/download/${VERSION}/droply-windows-x64.exe`}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 underline decoration-zinc-400 dark:decoration-zinc-700"
          >
            Windows x64
          </a>
          <span>·</span>
          <a
            href={REPO_RELEASES}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold uppercase tracking-wide flex items-center gap-0.5"
          >
            All releases <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline" />
          </a>
        </div>
      </div>
    </div>
  );
}
