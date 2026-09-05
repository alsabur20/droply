import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Send,
  Download,
  FileText,
  Copy,
  Check,
  QrCode,
  Terminal,
  RefreshCw,
  Zap,
  Lock,
  Settings
} from 'lucide-react';
import { useTransfer, getEffectiveSignalingUrl } from './hooks/useTransfer.js';
import { Dropzone } from './components/Dropzone.js';
import { ManifestModal } from './components/ManifestModal.js';
import { ProgressBar } from './components/ProgressBar.js';
import { QrModal } from './components/QrModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { ThemeToggle } from './components/ThemeToggle.js';

export function App() {
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'text'>('send');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textSnippet, setTextSnippet] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [showQr, setShowQr] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

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
    reset
  } = useTransfer();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (hash && hash.length > 3) {
      setInputCode(hash);
      setActiveTab('receive');
      startReceive(hash);
    }
  }, [startReceive]);

  const handleSendFiles = () => {
    if (selectedFiles.length > 0) {
      startSend(selectedFiles);
    }
  };

  const handleSendText = () => {
    if (textSnippet.trim()) {
      startSend([], textSnippet.trim());
    }
  };

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Droply
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  E2EE P2P
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/50 shadow-sm"
              title="Signaling Server Settings"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Navigation Tabs */}
        {status === 'idle' && (
          <div className="w-full grid grid-cols-3 p-1 rounded-2xl bg-slate-900 border border-slate-800/80 mb-8 shadow-md">
            <button
              onClick={() => setActiveTab('send')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'send'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              Send Files
            </button>
            <button
              onClick={() => setActiveTab('receive')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'receive'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              Receive
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'text'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Snippet
            </button>
          </div>
        )}

        {/* Content Box */}
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative">
          {/* ACTIVE TRANSFER OVERLAY */}
          {status !== 'idle' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Pairing Code Card */}
              {pairingCode && (
                <div className="text-center space-y-3">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Pairing Code
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-wide text-emerald-400 bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
                      {pairingCode}
                    </div>
                    <button
                      onClick={copyCode}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 shadow-sm"
                      title="Copy code"
                    >
                      {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setShowQr(true)}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 shadow-sm"
                      title="Show QR Code"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    CLI equivalent: <code className="text-emerald-400 font-mono">droply receive {pairingCode}</code>
                  </p>
                </div>
              )}

              {/* Status Message & Progress */}
              {status === 'transferring' ? (
                <ProgressBar metrics={metrics} statusMessage={statusMessage} />
              ) : status === 'completed' ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Transfer Completed!</h4>
                  <p className="text-sm text-slate-400">{statusMessage}</p>
                </div>
              ) : status === 'error' ? (
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                  <h4 className="text-lg font-bold text-rose-400">Transfer Failed</h4>
                  <p className="text-sm text-slate-400">{statusMessage}</p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">{statusMessage}</p>
                </div>
              )}

              {/* Reset / New Transfer Button */}
              {(status === 'completed' || status === 'error') && (
                <button
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start Another Transfer
                </button>
              )}
            </div>
          ) : (
            /* IDLE FORM VIEWS */
            <div>
              {/* Tab 1: Send Files */}
              {activeTab === 'send' && (
                <div className="space-y-6">
                  <Dropzone onFilesSelected={setSelectedFiles} />
                  <button
                    disabled={selectedFiles.length === 0}
                    onClick={handleSendFiles}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send {selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : 'Files'}
                  </button>
                </div>
              )}

              {/* Tab 2: Receive Files */}
              {activeTab === 'receive' && (
                <form onSubmit={handleReceive} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Enter Pairing Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="e.g. 4-cosmic-falcon or 482-195"
                        className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 font-mono text-center text-lg outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!inputCode.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Connect & Receive
                  </button>
                </form>
              )}

              {/* Tab 3: Text Snippet */}
              {activeTab === 'text' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Secret Text or Clipboard Note
                    </label>
                    <textarea
                      rows={5}
                      value={textSnippet}
                      onChange={(e) => setTextSnippet(e.target.value)}
                      placeholder="Paste secret keys, tokens, or clipboard text here..."
                      className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 text-sm font-mono outline-none transition-all resize-none shadow-inner"
                    />
                  </div>

                  <button
                    disabled={!textSnippet.trim()}
                    onClick={handleSendText}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send Secret Note
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Knowledge AES-256-GCM
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Direct WebRTC P2P
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Interoperable with CLI
          </span>
        </div>
      </main>

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
