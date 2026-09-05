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
  Radio,
  Key,
  ShieldCheck,
  Sliders,
  ExternalLink,
  Wifi,
  Sparkles
} from 'lucide-react';
import { useTransfer } from './hooks/useTransfer.js';
import { Dropzone } from './components/Dropzone.js';
import { ManifestModal } from './components/ManifestModal.js';
import { ProgressBar } from './components/ProgressBar.js';
import { QrModal } from './components/QrModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { ChunkMatrix } from './components/ChunkMatrix.js';
import { ProtocolMatrix } from './components/ProtocolMatrix.js';
import { TerminalShowcase } from './components/TerminalShowcase.js';

const GITHUB_REPO = 'https://github.com/alsabur20/droply';

export function App() {
  const [station, setStation] = useState<'send' | 'receive'>('send');
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
      setStation('receive');
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

  const scrollToMatrix = () => {
    document.getElementById('security-matrix')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-150">
      {/* Top Telemetry Strip */}
      <div className="w-full border-b-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 font-mono text-xs">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 font-bold text-zinc-950 dark:text-zinc-50 uppercase text-[11px] tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block animate-pulse" />
              <span>DROPLY</span>
              <span className="text-zinc-400 font-normal">/</span>
              <span className="text-zinc-600 dark:text-zinc-400 font-normal">P2P COMMAND CONSOLE</span>
            </div>
            <span className="hidden sm:inline text-zinc-400 dark:text-zinc-700">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SIGNALING RELAY: ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => setShowSettings(true)}
              className="px-2.5 py-1 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold border border-zinc-400 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
              title="Configure Relay & STUN"
            >
              <Sliders className="w-3 h-3 text-zinc-500" />
              <span>Relay Config</span>
            </button>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold border border-zinc-950 dark:border-zinc-100 flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col space-y-8">
        {/* Header / Hero */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-zinc-950 dark:border-zinc-800 pb-6">
          <div className="flex items-start gap-4">
            {/* Custom Arrow Logo Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-none bg-zinc-950 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-950 border-2 border-zinc-950 dark:border-zinc-100 flex items-center justify-center p-2.5 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-current">
                <rect x="8" y="8" width="48" height="48" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M32 16v26M21 27l11-11 11 11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
                <path d="M19 48h26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />
              </svg>
            </div>

            <div className="space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  ZERO-KNOWLEDGE PEER-TO-PEER
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                Direct Encrypted File Pipeline
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                Stream files and secrets directly between browser and terminal without intermediaries.
              </p>
            </div>
          </div>

          {/* Quick Header Tools */}
          <div className="flex items-center gap-2 self-start md:self-center font-mono">
            <button
              onClick={scrollToMatrix}
              className="px-3 py-2 rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-xs font-bold flex items-center gap-1.5"
              title="Security Specs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Specs</span>
            </button>
            <a
              href={`${GITHUB_REPO}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-xs font-bold flex items-center gap-1.5"
              title="Documentation"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* Cryptographic Telemetry HUD */}
        <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-3 sm:px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block animate-pulse" />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">PROTOCOL:</span>
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
              <span className="text-zinc-500 uppercase">TUNNEL:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">WebRTC DTLS / SCTP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-zinc-950 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] tracking-wider uppercase border border-zinc-950 dark:border-zinc-100">
              {status === 'transferring'
                ? 'TX / RX IN PROGRESS'
                : status === 'awaiting-consent'
                ? 'CONSENT VERIFICATION'
                : status === 'completed'
                ? 'SESSION COMPLETE'
                : 'SECURITY ACTIVE // READY'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRIMARY COMMAND CONSOLE STAGE (Unified Send & Receive)  */}
        {/* ======================================================== */}
        <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.85)] font-mono">
          {/* Segmented Mode Switcher Bar */}
          <div className="grid grid-cols-2 border-b-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                if (activeRole !== 'sender' || status === 'idle') {
                  setStation('send');
                }
              }}
              className={`py-3.5 px-4 font-bold flex items-center justify-center gap-2 transition-all ${
                station === 'send'
                  ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 border-b-2 border-emerald-500 -mb-[2px]'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>SEND PAYLOAD</span>
              {activeRole === 'sender' && status !== 'idle' && (
                <span className="w-2 h-2 bg-emerald-500 inline-block animate-ping ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeRole !== 'receiver' || status === 'idle') {
                  setStation('receive');
                }
              }}
              className={`py-3.5 px-4 font-bold flex items-center justify-center gap-2 transition-all border-l-2 border-zinc-950 dark:border-zinc-800 ${
                station === 'receive'
                  ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 border-b-2 border-emerald-500 -mb-[2px]'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>RECEIVE PAYLOAD</span>
              {activeRole === 'receiver' && status !== 'idle' && (
                <span className="w-2 h-2 bg-emerald-500 inline-block animate-ping ml-1" />
              )}
            </button>
          </div>

          {/* STATION CONTENT AREA */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* ---------------------------------------------------- */}
            {/* STATION 1: SEND PAYLOAD                             */}
            {/* ---------------------------------------------------- */}
            {station === 'send' && (
              <div className="space-y-6">
                {/* Secondary Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Mode switch: Files vs Secret Note */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-300 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsTextMode(false)}
                      className={`px-3 py-1 font-bold transition-all ${
                        !isTextMode
                          ? 'bg-zinc-950 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      Files & Folders
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTextMode(true)}
                      className={`px-3 py-1 font-bold transition-all ${
                        isTextMode
                          ? 'bg-zinc-950 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      Secret Note / Text
                    </button>
                  </div>

                  {/* Transport switch: Direct P2P vs Relay */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-300 dark:border-zinc-800 text-[11px]">
                    <span className="text-zinc-400 px-1">Route:</span>
                    <button
                      type="button"
                      onClick={() => setSendMode('direct')}
                      className={`px-2.5 py-1 font-bold transition-all ${
                        sendMode === 'direct'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-300 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      Direct P2P
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode('relay')}
                      className={`px-2.5 py-1 font-bold transition-all ${
                        sendMode === 'relay'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-300 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      ZK Relay
                    </button>
                  </div>
                </div>

                {/* SENDER ACTIVE TRANSFER STATE */}
                {activeRole === 'sender' && status !== 'idle' ? (
                  <div className="space-y-6">
                    {/* Pairing Code Card */}
                    {pairingCode && (
                      <div className="p-6 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          <span>PAIRING CODE</span>
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 inline-block animate-pulse" />
                            AWAITING PEER HANDSHAKE
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          <div className="text-2xl sm:text-4xl font-black tracking-wider text-zinc-950 dark:text-zinc-50 px-6 py-3 bg-white dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 select-all shadow-inner">
                            {pairingCode}
                          </div>
                          <button
                            onClick={copyCode}
                            className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                            title="Copy pairing code"
                          >
                            {copiedCode ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setShowQr(true)}
                            className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                            title="Show QR code"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Terminal helper */}
                        <div className="flex items-center justify-between gap-2 p-3 bg-zinc-950 text-zinc-100 border border-zinc-800 text-xs text-left">
                          <span className="truncate text-zinc-400">
                            <span className="text-emerald-400 font-bold">$</span> droply receive {pairingCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(`droply receive ${pairingCode}`)}
                            className="shrink-0 text-zinc-400 hover:text-zinc-100 px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-[11px] font-bold"
                          >
                            copy command
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar & Cryptographic Chunk Matrix */}
                    <div className="space-y-4">
                      {status === 'transferring' ? (
                        <>
                          <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                          <ChunkMatrix metrics={metrics} status={status} />
                        </>
                      ) : status === 'completed' ? (
                        <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-2">
                          <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Payload Transferred Successfully!
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                        </div>
                      ) : status === 'error' ? (
                        <div className="p-6 bg-rose-500/10 border-2 border-rose-500/40 text-center space-y-2">
                          <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            Transmission Failed
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                        </div>
                      ) : (
                        <div className="p-8 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-3">
                          <div className="w-6 h-6 bg-zinc-950 dark:bg-zinc-100 animate-spin mx-auto" />
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">
                            {statusMessage}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div>
                      {status === 'completed' || status === 'error' ? (
                        <button
                          type="button"
                          onClick={resetAll}
                          className="btn-tactile-outline w-full py-3.5 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Transmit Another File</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resetAll}
                          className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/30 shadow-[3px_3px_0px_0px_rgba(225,29,72,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          Cancel Transmission
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* SENDER IDLE INPUT */
                  <div className="space-y-6">
                    {isTextMode ? (
                      <div className="space-y-2">
                        <textarea
                          rows={7}
                          value={textSnippet}
                          onChange={(e) => setTextSnippet(e.target.value)}
                          placeholder="Paste secret text, authentication tokens, or private notes here..."
                          className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-100 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 text-xs font-mono resize-none transition-colors shadow-inner"
                        />
                        <div className="flex justify-between items-center text-[11px] text-zinc-500 px-1">
                          <span>{textSnippet.length} characters</span>
                          <button
                            type="button"
                            onClick={() => setIsTextMode(false)}
                            className="hover:underline font-bold text-zinc-800 dark:text-zinc-200"
                          >
                            Switch to files
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Dropzone
                        onFilesSelected={setSelectedFiles}
                        onToggleTextMode={() => setIsTextMode(true)}
                        isTextMode={false}
                      />
                    )}

                    {/* Transmit Button */}
                    <button
                      type="button"
                      disabled={isTextMode ? !textSnippet.trim() : selectedFiles.length === 0}
                      onClick={handleSend}
                      className="btn-tactile-dark w-full py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {isTextMode
                          ? 'Transmit Secret Note'
                          : selectedFiles.length > 0
                          ? `Transmit ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`
                          : 'Select Files to Transmit'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* STATION 2: RECEIVE PAYLOAD                           */}
            {/* ---------------------------------------------------- */}
            {station === 'receive' && (
              <div className="space-y-6">
                {activeRole === 'receiver' && status !== 'idle' ? (
                  <div className="space-y-6">
                    {/* Progress Bar & Cryptographic Chunk Matrix */}
                    <div className="space-y-4">
                      {status === 'transferring' ? (
                        <>
                          <ProgressBar metrics={metrics} statusMessage={statusMessage} />
                          <ChunkMatrix metrics={metrics} status={status} />
                        </>
                      ) : status === 'completed' ? (
                        <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-2">
                          <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Payload Downloaded & Decrypted!
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                        </div>
                      ) : status === 'error' ? (
                        <div className="p-6 bg-rose-500/10 border-2 border-rose-500/40 text-center space-y-2">
                          <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            Reception Failed
                          </h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{statusMessage}</p>
                        </div>
                      ) : (
                        <div className="p-8 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-700 text-center space-y-3">
                          <div className="w-6 h-6 bg-zinc-950 dark:bg-zinc-100 animate-spin mx-auto" />
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">
                            {statusMessage}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Pairing code: <code className="font-bold text-zinc-800 dark:text-zinc-200">{inputCode}</code>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div>
                      {status === 'completed' || status === 'error' ? (
                        <button
                          type="button"
                          onClick={resetAll}
                          className="btn-tactile-outline w-full py-3.5 font-mono text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Receive Another File</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={resetAll}
                          className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/30 shadow-[3px_3px_0px_0px_rgba(225,29,72,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          Cancel Reception
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* RECEIVER IDLE FORM */
                  <form onSubmit={handleReceive} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Pairing Code or Inbound Secret
                      </label>
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="e.g. 4-apple-orange-banana or numeric PIN"
                        className="w-full py-4 px-5 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-700 focus:border-zinc-950 dark:focus:border-zinc-100 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 font-mono text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] transition-all"
                      />
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Enter the pairing code provided by the sender. The file manifest will appear for your review before streaming begins.
                      </p>
                    </div>

                    {/* Live CLI Helper Box */}
                    <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                        <span>Terminal Command Equivalent</span>
                        <Terminal className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div className="flex items-center justify-between gap-2 bg-zinc-950 text-zinc-200 px-3 py-2 border border-zinc-800">
                        <span className="truncate font-mono">
                          <span className="text-emerald-400 font-bold">$</span> droply receive {inputCode.trim() || '<code>'}
                        </span>
                        {inputCode.trim() && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(`droply receive ${inputCode.trim()}`)}
                            className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 hover:text-white shrink-0 text-zinc-400 font-bold"
                          >
                            copy
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Receive Action Button */}
                    <button
                      type="submit"
                      disabled={!inputCode.trim()}
                      className="btn-tactile-dark w-full py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Connect & Receive Payload</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CLI & TERMINAL SHOWCASE                                  */}
        {/* ======================================================== */}
        <TerminalShowcase />

        {/* ======================================================== */}
        {/* CRYPTOGRAPHIC SPECIFICATION & PROTOCOL MATRIX            */}
        {/* ======================================================== */}
        <div id="security-matrix">
          <ProtocolMatrix />
        </div>

        {/* Footer */}
        <footer className="pt-6 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500 border-t-2 border-zinc-950 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">DROPLY</span>
            <span>•</span>
            <span>zero-knowledge p2p</span>
            <span>•</span>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="hover:underline">
              github
            </a>
            <span>•</span>
            <a href={`${GITHUB_REPO}/releases`} target="_blank" rel="noopener noreferrer" className="hover:underline">
              releases
            </a>
          </div>

          <div className="text-[11px] opacity-75 font-mono">
            [ end-to-end encrypted · zero cloud storage · open source ]
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

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
