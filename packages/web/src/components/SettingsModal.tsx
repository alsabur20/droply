import React, { useState } from 'react';
import { Settings, Server, X, Check, RotateCcw } from 'lucide-react';
import { getEffectiveSignalingUrl } from '../hooks/useTransfer.js';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const currentSaved = localStorage.getItem('droply_server_url') || localStorage.getItem('direct_server_url') || '';
  const [serverUrl, setServerUrl] = useState(currentSaved);
  const [saved, setSaved] = useState(false);

  const effective = getEffectiveSignalingUrl(serverUrl);
  const isGithubPages = window.location.hostname.includes('github.io');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverUrl.trim()) {
      localStorage.setItem('droply_server_url', serverUrl.trim());
    } else {
      localStorage.removeItem('droply_server_url');
      localStorage.removeItem('direct_server_url');
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left relative">
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

        {isGithubPages && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
            <strong>GitHub Pages Note:</strong> GitHub Pages hosts static web assets. Point this setting to your deployed Droply signaling server (e.g. <code className="font-mono bg-amber-950/50 px-1 py-0.5 rounded">wss://droply.yourdomain.com</code>) to connect peers.
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
              placeholder="e.g. wss://droply.yourdomain.com or ws://localhost:3000"
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 font-mono text-sm outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Active endpoint: <code className="text-emerald-400 font-mono">{effective}</code>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
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
