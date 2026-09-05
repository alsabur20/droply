import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  Copy,
  Check,
  QrCode,
  Terminal,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Github,
  FileText,
  Lock,
  ArrowRight,
  Shield,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useTransfer } from './hooks/useTransfer.js';
import { Dropzone } from './components/Dropzone.js';
import { ManifestModal } from './components/ManifestModal.js';
import { ProgressBar } from './components/ProgressBar.js';
import { QrModal } from './components/QrModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { RelaySettingsBar } from './components/RelaySettingsBar.js';
import { CliBanner } from './components/CliBanner.js';
import { ArchitectureCards } from './components/ArchitectureCards.js';

const GITHUB_REPO = 'https://github.com/alsabur20/droply';

export function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTextMode, setIsTextMode] = useState<boolean>(false);
  const [textSnippet, setTextSnippet] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [showQr, setShowQr] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'sender' | 'receiver' | null>(null);
  const [sendMode, setSendMode] = useState<'direct' | 'relay'>('direct');

  const {
    status,
    statusMessage,
    pairingCode,
    manifest,
    metrics,
    startSend,
    startReceive,
    acceptTransfer,
    rejectTransfer,
    reset: hookReset
  } = useTransfer();

  const resetAll = () => {
    hookReset();
    setActiveRole(null);
  };

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (hash && hash.length > 3) {
      setInputCode(hash);
      setActiveRole('receiver');
      startReceive(hash);
    }
  }, [startReceive]);

  const handleSend = () => {
    if (isTextMode) {
      if (textSnippet.trim()) {
        setActiveRole('sender');
        startSend([], textSnippet.trim());
      }
    } else {
      if (selectedFiles.length > 0) {
        setActiveRole('sender');
        startSend(selectedFiles);
      }
    }
  };

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveRole('receiver');
      startReceive(inputCode.trim());
    }
  };

  const copyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const scrollToNotes = () => {
    document.getElementById('architecture-notes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-150">
      {/* Top Banner */}
      <div className="w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 truncate">
            <Heart className="w-3.5 h-3.5 text-zinc-500 shrink-0 fill-current" />
            <span className="truncate">
              droply is free and open-source. Send files easily without intermediaries.
            </span>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-2.5 py-1 rounded bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold transition-colors border border-zinc-300 dark:border-zinc-800 flex items-center gap-1.5 text-[11px]"
          >
            <Github className="w-3 h-3" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Main App Container */}
      <div className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col space-y-8">
        {/* Header / Hero */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Minimalist Retro Graphic Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center p-2 shrink-0 shadow-sm">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-zinc-100">
                <rect x="10" y="10" width="44" height="44" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M32 20v24M24 28l8-8 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 46h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Droply is a free and open-source tool to:
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Send files, secured end-to-end.
              </h1>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={scrollToNotes}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 transition-colors"
              title="How it works"
              aria-label="Security Notes"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <a
              href={`${GITHUB_REPO}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 transition-colors"
              title="Documentation & Guide"
              aria-label="Documentation"
            >
              <BookOpen className="w-4 h-4" />
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 transition-colors"
              title="GitHub Source"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Sub-tabs Bar */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsTextMode(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              !isTextMode
                ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 font-bold'
                : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>
          <button
            onClick={() => setIsTextMode(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              isTextMode
                ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 font-bold'
                : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Snippet</span>
          </button>
        </div>

        {/* Main Dual Panels (Send & Receive) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT PANEL: SEND */}
          <div className="border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-bold text-lg">
                  <Upload className="w-4 h-4" />
                  <h2>Send</h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Choose several files. Share one droply code.
                </p>
              </div>

              {/* Mode Selector (Direct vs Relay) */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSendMode('direct')}
                  className={`py-1.5 px-3 rounded text-center transition-colors ${
                    sendMode === 'direct'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Direct (P2P)
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('relay')}
                  className={`py-1.5 px-3 rounded text-center transition-colors ${
                    sendMode === 'relay'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Zero-Knowledge Relay
                </button>
              </div>

              {/* SENDER ACTIVE TRANSFER STATE */}
              {activeRole === 'sender' && status !== 'idle' ? (
                <div className="space-y-5 py-2 font-mono">
                  {/* Pairing Code Box */}
                  {pairingCode && (
                    <div className="p-5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-center space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Pairing Code
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-2xl sm:text-3xl font-black tracking-wider text-zinc-950 dark:text-zinc-50 px-4 py-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-300 dark:border-zinc-800 select-all">
                          {pairingCode}
                        </div>
                        <button
                          onClick={copyCode}
                          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 transition-colors"
                          title="Copy pairing code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setShowQr(true)}
                          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-800 transition-colors"
                          title="Show QR code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        CLI: <code className="text-zinc-800 dark:text-zinc-200">droply receive {pairingCode}</code>
                      </p>
                    </div>
                  )}

                  {/* Transfer Progress / Status */}
                  {status === 'transferring' ? (
                    <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                  ) : status === 'completed' ? (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Transfer Completed!</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : status === 'error' ? (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Transfer Failed</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 text-center space-y-2">
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">{statusMessage}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* SENDER IDLE FORM */
                <div className="space-y-4">
                  {isTextMode ? (
                    <div className="space-y-2 font-mono">
                      <textarea
                        rows={6}
                        value={textSnippet}
                        onChange={(e) => setTextSnippet(e.target.value)}
                        placeholder="Paste secret note, tokens, or clipboard text here..."
                        className="w-full p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs font-mono resize-none transition-colors"
                      />
                      <div className="flex justify-between items-center text-[11px] text-zinc-500 px-1">
                        <span>{textSnippet.length} characters</span>
                        <button
                          type="button"
                          onClick={() => setIsTextMode(false)}
                          className="hover:underline hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Drop files instead
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Dropzone
                      onFilesSelected={setSelectedFiles}
                      onToggleTextMode={() => setIsTextMode(!isTextMode)}
                      isTextMode={isTextMode}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Send Action Button */}
            <div>
              {activeRole === 'sender' && (status === 'completed' || status === 'error') ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Send Another File
                </button>
              ) : activeRole === 'sender' && status !== 'idle' ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono text-xs font-bold transition-colors"
                >
                  Cancel Transfer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isTextMode ? !textSnippet.trim() : selectedFiles.length === 0}
                  onClick={handleSend}
                  className="w-full py-3.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isTextMode
                      ? 'Send Secret Note'
                      : selectedFiles.length > 0
                      ? `Send ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`
                      : 'Send file'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: RECEIVE */}
          <div className="border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-bold text-lg">
                  <Download className="w-4 h-4" />
                  <h2>Receive</h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a droply code or stored link. Review before saving or displaying.
                </p>
              </div>

              {/* RECEIVER ACTIVE TRANSFER STATE */}
              {activeRole === 'receiver' && status !== 'idle' ? (
                <div className="space-y-5 py-4 font-mono">
                  {status === 'transferring' ? (
                    <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                  ) : status === 'completed' ? (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Transfer Completed!</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : status === 'error' ? (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Transfer Failed</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-800 text-center space-y-3">
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{statusMessage}</p>
                      <p className="text-[11px] text-zinc-500">Pairing code: <code className="font-bold text-zinc-800 dark:text-zinc-200">{inputCode}</code></p>
                    </div>
                  )}
                </div>
              ) : (
                /* RECEIVER IDLE FORM */
                <form onSubmit={handleReceive} className="space-y-4 font-mono">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Droply Code or Stored Link
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="word-word-word or numeric PIN"
                      className="w-full py-3.5 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 font-mono text-sm transition-colors"
                    />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed pt-1">
                      Paste or type the code, stored link, or CLI token, then press Enter or select Receive.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Receive Action Button */}
            <div>
              {activeRole === 'receiver' && (status === 'completed' || status === 'error') ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Receive Another File
                </button>
              ) : activeRole === 'receiver' && status !== 'idle' ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputCode.trim()}
                  onClick={handleReceive}
                  className="w-full py-3.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receive</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Relay Settings Accordion Bar */}
        <RelaySettingsBar />

        {/* CLI Banner Section with Detected OS */}
        <CliBanner />

        {/* Notes & Architecture Explainer */}
        <div id="architecture-notes">
          <ArchitectureCards />
        </div>

        {/* Bottom Feature Navigation Bar */}
        <div className="w-full border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-zinc-500" />
              <span>Send in browser</span>
            </div>
            <p className="text-[11px] text-zinc-500">No install needed</p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Receive in browser</span>
            </div>
            <p className="text-[11px] text-zinc-500">Paste code or link</p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Droply CLI</span>
            </div>
            <p className="text-[11px] text-zinc-500">Win, macOS, Linux</p>
          </div>

          <div className="space-y-1">
            <a
              href={`${GITHUB_REPO}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>Read guide</span>
            </a>
            <p className="text-[11px] text-zinc-500">Install & usage docs</p>
          </div>

          <div className="space-y-1">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5 text-zinc-500" />
              <span>Explore code</span>
            </a>
            <p className="text-[11px] text-zinc-500">Source & releases</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <span>made for privacy</span>
            <span>•</span>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="hover:underline">
              github
            </a>
            <span>•</span>
            <a href={`${GITHUB_REPO}/releases`} target="_blank" rel="noopener noreferrer" className="hover:underline">
              v1.0.0
            </a>
          </div>

          <div className="text-[11px] opacity-75">
            end-to-end encrypted · zero cloud storage
          </div>
        </footer>
      </div>

      {/* Manifest Consent Modal */}
      {status === 'awaiting-consent' && manifest && (
        <ManifestModal
          manifest={manifest}
          onAccept={acceptTransfer}
          onReject={rejectTransfer}
        />
      )}

      {/* QR Code Modal */}
      {showQr && pairingCode && (
        <QrModal code={pairingCode} onClose={() => setShowQr(false)} />
      )}

      {/* Settings Modal (if opened via hotkey or direct action) */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
