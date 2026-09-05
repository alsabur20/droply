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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Server Connection</h3>
            <p className="text-xs text-slate-400">Signaling & Zero-Knowledge Relay Endpoint</p>
          </div>
        </div>


        {isMixedContent && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>Mixed Content Block:</strong> Browsers forbid insecure <code className="font-mono bg-rose-950/50 px-1 py-0.5 rounded">ws://</code> connections from an HTTPS page. Please provide a secure <code className="font-mono bg-rose-950/50 px-1 py-0.5 rounded">wss://</code> URL with TLS/SSL.
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
               Signaling WebSocket URL
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder={isHttps ? "e.g. wss://droply-server.onrender.com" : "e.g. ws://localhost:3000"}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 font-mono text-sm outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Active endpoint:{' '}
              {effective ? (
                <code className="text-emerald-400 font-mono">{effective}</code>
              ) : (
                <span className="text-amber-400 font-medium">None (Transfer disabled until configured)</span>
              )}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">Quick Setup Options:</div>
            <div>• <strong>Run locally:</strong> Run <code className="text-slate-200 font-mono">droply serve</code> in terminal, then open <code className="text-slate-200 font-mono">http://localhost:3000</code>.</div>
            <div>• <strong>Free 24/7 cloud relay:</strong> Deploy the Droply Docker image to Render or Railway for a free <code className="text-slate-200 font-mono">wss://...</code> URL.</div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md shadow-emerald-950/40"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
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
