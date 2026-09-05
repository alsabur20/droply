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
  Heart,
  Lock,
  Radio,
  Key
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
      <div className="w-full border-b-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 font-mono text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 truncate">
            <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block shrink-0 animate-pulse" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">DROPLY</span>
            <span className="text-zinc-400">/</span>
            <span className="truncate text-zinc-600 dark:text-zinc-400">
              Open-source direct P2P mesh transfer. Zero cloud storage.
            </span>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-2.5 py-1 rounded-none bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold transition-all border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 text-[11px]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Main App Container */}
      <div className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col space-y-8">
        {/* Header / Hero */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Minimalist Brutalist Graphic Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-none bg-zinc-950 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-100 flex items-center justify-center p-2.5 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-current">
                <rect x="8" y="8" width="48" height="48" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M32 18v28M22 28l10-10 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
                <path d="M20 50h24" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </div>

            <div className="space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-400 dark:border-zinc-700">
                  SECURE WIRE // P2P
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Send files, secured end-to-end.
              </h1>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 self-start md:self-center font-mono">
            <button
              onClick={scrollToNotes}
              className="w-10 h-10 flex items-center justify-center rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              title="How it works"
              aria-label="Security Notes"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <a
              href={`${GITHUB_REPO}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              title="Documentation & Guide"
              aria-label="Documentation"
            >
              <BookOpen className="w-4 h-4" />
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              title="GitHub Source"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* NOVELTY: Cryptographic Telemetry HUD */}
        <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-3 sm:px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block animate-pulse" />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase">CORE:</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold">v1.0-ED25519</span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 uppercase">CIPHER:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">AES-256-GCM</span>
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 select-none">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 uppercase">PAKE:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">P-256 SPAKE2</span>
            </div>
            <span className="hidden md:inline text-zinc-300 dark:text-zinc-700 select-none">|</span>
            <div className="hidden md:flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-zinc-500 uppercase">CHANNEL:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">P2P WebRTC / DTLS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] tracking-wider uppercase border border-zinc-950 dark:border-zinc-100">
              {status === 'transferring'
                ? 'TX / RX IN PROGRESS'
                : status === 'awaiting-consent'
                ? 'CONSENT VERIFICATION'
                : status === 'completed'
                ? 'SESSION SECURED & DONE'
                : 'SECURITY ACTIVE // READY'}
            </span>
          </div>
        </div>

        {/* Sub-tabs Bar */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => setIsTextMode(false)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none border-2 font-bold transition-all ${
              !isTextMode
                ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)]'
                : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>
          <button
            onClick={() => setIsTextMode(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none border-2 font-bold transition-all ${
              isTextMode
                ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)]'
                : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text Snippet</span>
          </button>
        </div>

        {/* Main Dual Panels (Send & Receive) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT PANEL: SEND */}
          <div className="border-2 border-zinc-950 dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-950 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.85)]">
            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-bold text-lg">
                    <Upload className="w-5 h-5" />
                    <h2>Send</h2>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 uppercase">
                    TX_OUT
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select files or secret text. Share the generated pairing token.
                </p>
              </div>

              {/* Mode Selector (Direct vs Relay) */}
              <div className="grid grid-cols-2 p-1 rounded-none bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSendMode('direct')}
                  className={`py-1.5 px-3 rounded-none text-center transition-all ${
                    sendMode === 'direct'
                      ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Direct (P2P)
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode('relay')}
                  className={`py-1.5 px-3 rounded-none text-center transition-all ${
                    sendMode === 'relay'
                      ? 'bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]'
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
                    <div className="p-5 rounded-none bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        <span>Pairing Code</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">READY TO TRANSMIT</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-2xl sm:text-3xl font-black tracking-wider text-zinc-950 dark:text-zinc-50 px-4 py-2 bg-white dark:bg-zinc-950 rounded-none border-2 border-zinc-950 dark:border-zinc-700 select-all shadow-inner">
                          {pairingCode}
                        </div>
                        <button
                          onClick={copyCode}
                          className="p-2.5 rounded-none bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                          title="Copy pairing code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setShowQr(true)}
                          className="p-2.5 rounded-none bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                          title="Show QR code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Live Terminal Command helper */}
                      <div className="flex items-center justify-between gap-2 p-2 bg-zinc-950 text-zinc-100 border border-zinc-800 text-[11px] text-left">
                        <span className="truncate text-zinc-400 font-mono">
                          <span className="text-emerald-400 font-bold">$</span> droply receive {pairingCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`droply receive ${pairingCode}`);
                          }}
                          className="shrink-0 text-zinc-400 hover:text-zinc-100 px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-[10px] font-bold"
                          title="Copy CLI command"
                        >
                          copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Transfer Progress / Status */}
                  {status === 'transferring' ? (
                    <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                  ) : status === 'completed' ? (
                    <div className="p-4 rounded-none bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-2">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Transfer Completed!
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : status === 'error' ? (
                    <div className="p-4 rounded-none bg-rose-500/10 border-2 border-rose-500/30 text-center space-y-2">
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        Transfer Failed
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-none bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-3">
                      <div className="w-5 h-5 bg-zinc-950 dark:bg-zinc-100 border border-zinc-950 dark:border-zinc-100 animate-spin mx-auto rounded-none" />
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold">{statusMessage}</p>
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
                        className="w-full p-4 rounded-none bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-100 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs font-mono resize-none transition-colors shadow-inner"
                      />
                      <div className="flex justify-between items-center text-[11px] text-zinc-500 px-1">
                        <span>{textSnippet.length} characters</span>
                        <button
                          type="button"
                          onClick={() => setIsTextMode(false)}
                          className="hover:underline font-bold text-zinc-800 dark:text-zinc-200"
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
                  className="btn-tactile-outline w-full py-3 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider rounded-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send Another File</span>
                </button>
              ) : activeRole === 'sender' && status !== 'idle' ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/30 shadow-[3px_3px_0px_0px_rgba(225,29,72,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-mono text-xs font-bold transition-all uppercase tracking-wider"
                >
                  Cancel Transfer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isTextMode ? !textSnippet.trim() : selectedFiles.length === 0}
                  onClick={handleSend}
                  className="btn-tactile-dark w-full py-3.5 px-4 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 rounded-none"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isTextMode
                      ? 'Transmit Secret Note'
                      : selectedFiles.length > 0
                      ? `Transmit ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`
                      : 'Select File to Send'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: RECEIVE */}
          <div className="border-2 border-zinc-950 dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-950 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.85)]">
            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-950 dark:text-zinc-50 font-bold text-lg">
                    <Download className="w-5 h-5" />
                    <h2>Receive</h2>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 uppercase">
                    RX_IN
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enter pairing code or token to stream payload directly to your device.
                </p>
              </div>

              {/* RECEIVER ACTIVE TRANSFER STATE */}
              {activeRole === 'receiver' && status !== 'idle' ? (
                <div className="space-y-5 py-4 font-mono">
                  {status === 'transferring' ? (
                    <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                  ) : status === 'completed' ? (
                    <div className="p-4 rounded-none bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-2">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Transfer Completed!
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : status === 'error' ? (
                    <div className="p-4 rounded-none bg-rose-500/10 border-2 border-rose-500/30 text-center space-y-2">
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        Transfer Failed
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-none bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-3">
                      <div className="w-6 h-6 bg-zinc-950 dark:bg-zinc-100 border border-zinc-950 dark:border-zinc-100 animate-spin mx-auto rounded-none" />
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold">{statusMessage}</p>
                      <p className="text-[11px] text-zinc-500">
                        Pairing code: <code className="font-bold text-zinc-800 dark:text-zinc-200">{inputCode}</code>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* RECEIVER IDLE FORM */
                <form onSubmit={handleReceive} className="space-y-4 font-mono">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                      Droply Code or Relay Token
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. 4-apple-orange-banana or PIN"
                      className="w-full py-3.5 px-4 rounded-none bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-100 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 font-mono text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                    />
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Enter sender's code and click Receive to initiate zero-knowledge handshake.
                    </p>
                  </div>

                  {/* NOVELTY: Interactive Live CLI Command Box */}
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 font-mono text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                      <span>CLI Command Equivalent</span>
                      <Terminal className="w-3 h-3 text-zinc-500" />
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-zinc-950 text-zinc-200 px-2.5 py-1.5 border border-zinc-800 text-[11px]">
                      <span className="truncate font-mono">
                        <span className="text-emerald-400 font-bold">$</span> droply receive {inputCode.trim() || '<code>'}
                      </span>
                      {inputCode.trim() && (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(`droply receive ${inputCode.trim()}`)}
                          className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 hover:text-white shrink-0 text-zinc-400 font-bold"
                        >
                          copy
                        </button>
                      )}
                    </div>
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
                  className="btn-tactile-outline w-full py-3 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider rounded-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Receive Another File</span>
                </button>
              ) : activeRole === 'receiver' && status !== 'idle' ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/30 shadow-[3px_3px_0px_0px_rgba(225,29,72,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-mono text-xs font-bold transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!inputCode.trim()}
                  onClick={handleReceive}
                  className="btn-tactile-dark w-full py-3.5 px-4 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 rounded-none"
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
        <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-950 p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]">
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
        <footer className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500 border-t-2 border-zinc-950 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">DROPLY</span>
            <span>•</span>
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

          <div className="text-[11px] opacity-75 font-mono">
            [ end-to-end encrypted · zero cloud storage ]
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
