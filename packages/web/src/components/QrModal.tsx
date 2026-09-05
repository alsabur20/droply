import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, QrCode as QrIcon, X, Terminal } from 'lucide-react';

interface QrModalProps {
  code: string;
  onClose: () => void;
}

export function QrModal({ code, onClose }: QrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const shareUrl = `${window.location.origin}/#${code}`;
  const cliCommand = `droply receive ${code}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    }
  }, [shareUrl]);

  const copyToClipboard = (text: string, isCli: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCli) {
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <QrIcon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Scan to Receive</h3>
          <p className="text-xs text-slate-400 mt-1">
            Open camera on mobile to instantly pair and download
          </p>
        </div>

        {/* QR Canvas */}
        <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mx-auto">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>

        <div className="space-y-2 text-left">
          {/* Web Link Copy */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="truncate text-slate-300 mr-2">{shareUrl}</span>
            <button
              onClick={() => copyToClipboard(shareUrl, false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* CLI Command Copy */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 truncate text-emerald-400 font-mono mr-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{cliCommand}</span>
            </div>
            <button
              onClick={() => copyToClipboard(cliCommand, true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
              title="Copy CLI command"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
