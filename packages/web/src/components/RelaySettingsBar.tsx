import React, { useState, useEffect } from 'react';
import { Sliders, ChevronDown, ChevronUp, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { getEffectiveSignalingUrl } from '../hooks/useTransfer.js';

export function RelaySettingsBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('droply_server_url') || localStorage.getItem('direct_server_url') || '';
      setServerUrl(stored);
    }
  }, []);

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const effective = getEffectiveSignalingUrl(serverUrl);
  const isMixedContent = isHttps && (serverUrl.trim().startsWith('ws://') || (!serverUrl.trim() && effective.startsWith('ws://')));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = serverUrl.trim();
    if (trimmed) {
      if (trimmed.startsWith('http://')) {
        trimmed = trimmed.replace(/^http:\/\//, 'ws://');
      } else if (trimmed.startsWith('https://')) {
        trimmed = trimmed.replace(/^https:\/\//, 'wss://');
      } else if (!trimmed.startsWith('ws://') && !trimmed.startsWith('wss://')) {
        trimmed = `${isHttps ? 'wss://' : 'ws://'}${trimmed}`;
      }
      localStorage.setItem('droply_server_url', trimmed);
      setServerUrl(trimmed);
    } else {
      localStorage.removeItem('droply_server_url');
      localStorage.removeItem('direct_server_url');
      setServerUrl('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    localStorage.removeItem('droply_server_url');
    localStorage.removeItem('direct_server_url');
    setServerUrl('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="w-full border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 font-mono text-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2 font-medium">
          <Sliders className="w-3.5 h-3.5" />
          <span>Relay settings</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 uppercase tracking-widest text-[11px]">
          <span>Advanced</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4">
          {isMixedContent && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Browsers block unencrypted <code className="px-1 rounded bg-rose-500/20">ws://</code> on HTTPS pages. Please provide a secure <code className="px-1 rounded bg-rose-500/20">wss://</code> URL.
              </span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                Signaling & Relay Server WebSocket URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder={isHttps ? "e.g. wss://droply-server.onrender.com" : "e.g. ws://localhost:3000"}
                  className="flex-1 py-2 px-3 rounded bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:border-zinc-500 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 font-mono text-xs"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 rounded bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-100 dark:text-zinc-950 font-bold transition-colors flex items-center gap-1.5 text-[11px]"
                  >
                    {saved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
              <div>
                Active endpoint: <code className="text-zinc-900 dark:text-zinc-200 font-semibold">{effective || 'None'}</code>
              </div>
              <div className="opacity-80">
                To run a private relay: <code className="text-zinc-700 dark:text-zinc-300">droply serve</code> on any server or local port.
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
