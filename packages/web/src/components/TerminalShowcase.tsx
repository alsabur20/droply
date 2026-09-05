import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export function TerminalShowcase() {
  const [activeTab, setActiveTab] = useState<'install' | 'send' | 'receive' | 'npx'>('install');
  const [copied, setCopied] = useState<boolean>(false);

  const TABS = [
    { id: 'install', label: '1. Install' },
    { id: 'send', label: '2. Send File' },
    { id: 'receive', label: '3. Receive File' },
    { id: 'npx', label: '4. Instant (npx)' }
  ] as const;

  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'install':
        return `# Quick one-line installer (Linux / macOS):\ncurl -fsSL https://raw.githubusercontent.com/alsabur20/droply/main/install.sh | bash\n\n# Or install globally via npm:\nnpm install -g droply-cli`;
      case 'send':
        return `$ droply send my-presentation.pdf\n\n[PAKE] Pairing Code: 4-cosmic-falcon\n[SIGNALING] Registered on relay. Awaiting receiver handshake...\n[PEER] Peer connected via direct WebRTC DataChannel (DTLS)\n[CIPHER] AES-256-GCM symmetric session key derived\n[PROGRESS] my-presentation.pdf [████████████████████] 100% (14.8 MB/s)\n[DONE] Transfer complete. All 232 blocks verified!`;
      case 'receive':
        return `$ droply receive 4-cosmic-falcon\n\n[PAKE] Verifying secret handshake with sender...\n[PEER] WebRTC DataChannel established\n[MANIFEST] Incoming: my-presentation.pdf (18.4 MB)\n[SAVING] Received to ./my-presentation.pdf\n[CHECKSUM] SHA-256 verification passed!`;
      case 'npx':
        return `# Zero-installation run via npx:\nnpx droply-cli send secret-backup.tar.gz\n\n# Or receive anywhere:\nnpx droply-cli receive <code-or-token>`;
    }
  };

  const copyToClipboard = () => {
    const raw = activeTab === 'install'
      ? 'curl -fsSL https://raw.githubusercontent.com/alsabur20/droply/main/install.sh | bash'
      : activeTab === 'npx'
      ? 'npx droply-cli send <file>'
      : activeTab === 'send'
      ? 'droply send <filename>'
      : 'droply receive <code>';

    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-6 sm:p-8 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.85)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-zinc-950 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
              CLI & TERMINAL SUITE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            Native Terminal Interoperability
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/alsabur20/droply/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-400 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GitHub Releases</span>
          </a>
        </div>
      </div>

      {/* Interactive Mock Terminal Window */}
      <div className="border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
        {/* Terminal Window Chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-zinc-700 inline-block" />
            <span className="w-3 h-3 bg-zinc-700 inline-block" />
            <span className="w-3 h-3 bg-zinc-700 inline-block" />
            <span className="text-zinc-400 font-bold ml-2 text-[11px]">droply-cli — bash</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-emerald-400 font-bold border-b-2 border-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Content Screen */}
        <div className="p-4 sm:p-6 text-xs sm:text-sm font-mono leading-relaxed space-y-4">
          <pre className="text-zinc-300 whitespace-pre-wrap overflow-x-auto selection:bg-zinc-700 selection:text-white">
            {getCodeSnippet()}
          </pre>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full wire compatibility with web browser client</span>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied command!' : 'Copy snippet'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
