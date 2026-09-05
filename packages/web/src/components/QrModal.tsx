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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 rounded-none max-w-sm w-full p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] space-y-5 text-center relative font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-950 dark:hover:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-10 h-10 rounded-none bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
          <QrIcon className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">Mobile QR Pairing</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Scan with device camera to open web client and connect
          </p>
        </div>

        {/* QR Canvas */}
        <div className="p-3 bg-white rounded-none inline-block border-2 border-zinc-900 shadow-sm mx-auto">
          <canvas ref={canvasRef} className="rounded-none" />
        </div>

        <div className="space-y-2 text-left">
          {/* Web Link Copy */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-none border-2 border-zinc-300 dark:border-zinc-800 text-xs">
            <span className="truncate text-zinc-700 dark:text-zinc-300 mr-2">{shareUrl}</span>
            <button
              onClick={() => copyToClipboard(shareUrl, false)}
              className="p-1.5 rounded-none bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-400 dark:border-zinc-700 transition-colors shrink-0"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* CLI Command Copy */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-none border-2 border-zinc-300 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5 truncate text-zinc-900 dark:text-zinc-100 font-mono mr-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{cliCommand}</span>
            </div>
            <button
              onClick={() => copyToClipboard(cliCommand, true)}
              className="p-1.5 rounded-none bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-400 dark:border-zinc-700 transition-colors shrink-0"
              title="Copy CLI command"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
