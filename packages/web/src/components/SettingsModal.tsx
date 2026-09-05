import React, { useState } from 'react';
import { Settings, Server, X, Check, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';
import { getEffectiveSignalingUrl } from '../hooks/useTransfer.js';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const currentSaved = localStorage.getItem('droply_server_url') || localStorage.getItem('direct_server_url') || '';
  const [serverUrl, setServerUrl] = useState(currentSaved);
  const [saved, setSaved] = useState(false);

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
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    localStorage.removeItem('droply_server_url');
    localStorage.removeItem('direct_server_url');
    setServerUrl('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 rounded-none max-w-md w-full p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] space-y-4 text-left relative font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-950 dark:hover:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">Server Endpoint</h3>
            <p className="text-xs text-zinc-500">Signaling & Zero-Knowledge Relay Configuration</p>
          </div>
        </div>

        {isMixedContent && (
          <div className="p-3.5 rounded-none bg-rose-500/10 border-2 border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <strong>Mixed Content Block:</strong> Browsers forbid insecure <code className="bg-rose-500/20 px-1 py-0.5 font-bold">ws://</code> connections from an HTTPS page. Please provide a secure <code className="bg-rose-500/20 px-1 py-0.5 font-bold">wss://</code> URL.
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
               Signaling WebSocket URL
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder={isHttps ? "e.g. wss://droply-server.onrender.com" : "e.g. ws://localhost:3000"}
              className="w-full py-2.5 px-3.5 rounded-none bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-800 focus:border-zinc-950 dark:focus:border-zinc-100 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-mono text-xs transition-all"
            />
            <p className="text-[11px] text-zinc-500">
              Active endpoint:{' '}
              {effective ? (
                <code className="text-zinc-950 dark:text-zinc-50 font-bold">{effective}</code>
              ) : (
                <span className="text-amber-500 font-medium">None (Transfer disabled until configured)</span>
              )}
            </p>
          </div>

          <div className="p-3 rounded-none bg-zinc-50 dark:bg-zinc-950/60 border-2 border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1.5">
            <div className="font-bold text-zinc-900 dark:text-zinc-300 uppercase text-[10px]">Quick Setup:</div>
            <div>• <strong>Local:</strong> Run <code className="text-zinc-800 dark:text-zinc-200 font-bold">droply serve</code>, then open <code className="text-zinc-800 dark:text-zinc-200">http://localhost:3000</code>.</div>
            <div>• <strong>Cloud Relay:</strong> Deploy Droply to Render for a free <code className="text-zinc-800 dark:text-zinc-200">wss://...</code> URL.</div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-none bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors border border-zinc-400 dark:border-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-none bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-50 dark:text-zinc-950 font-bold text-xs transition-all border-2 border-zinc-950 dark:border-zinc-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Endpoint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
