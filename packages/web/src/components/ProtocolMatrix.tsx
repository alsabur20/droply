import React, { useState } from 'react';
import { Shield, Key, Network, Terminal, ChevronDown, Check } from 'lucide-react';

interface MatrixPillar {
  id: string;
  tag: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  details: string[];
}

const PILLARS: MatrixPillar[] = [
  {
    id: 'pake',
    tag: 'PILLAR // 01',
    title: 'Zero-Knowledge PAKE',
    badge: 'P-256 SPAKE2',
    icon: <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    summary: 'Mutual cryptographic proof derived from short human-readable codes without leaking the secret.',
    details: [
      'The pairing code (e.g. 4-apple-orange-banana) acts as a high-entropy salt for PAKE key exchange.',
      'Neither the signaling relay nor man-in-the-middle eavesdroppers learn the code or derived key.',
      'Guaranteed forward secrecy: ephemeral session keys are destroyed immediately upon transfer completion.'
    ]
  },
  {
    id: 'cipher',
    tag: 'PILLAR // 02',
    title: 'Authenticated Encryption',
    badge: 'AES-256-GCM',
    icon: <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    summary: 'Every file slice is split into 64KB authenticated chunks with GHASH message integrity tags.',
    details: [
      'Each 64KB block includes an incrementing 96-bit cryptographic nonce preventing replay attacks.',
      'Corrupted or tampered packets fail decryption automatically before being written to disk.',
      'Full file SHA-256 checksums are verified before recipient file saving.'
    ]
  },
  {
    id: 'webrtc',
    tag: 'PILLAR // 03',
    title: 'Direct P2P Mesh Tunnel',
    badge: 'WebRTC / SCTP',
    icon: <Network className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    summary: 'Direct device-to-device transport bypassing cloud servers with encrypted DTLS channels.',
    details: [
      'STUN/ICE candidates establish the lowest-latency direct local or internet socket between peers.',
      'SCTP ordered data channels stream multi-gigabyte payloads without browser memory buffer bloat.',
      'Zero-knowledge relay fallback activates only if restrictive corporate firewalls prevent direct peering.'
    ]
  },
  {
    id: 'interop',
    tag: 'PILLAR // 04',
    title: 'Unified CLI & Web Engine',
    badge: 'Cross-Platform',
    icon: <Terminal className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    summary: 'Full wire compatibility across browsers, Linux, macOS, and Windows terminals.',
    details: [
      'Send from terminal with `npx droply-cli send` and receive in browser, or vice-versa.',
      'No registration, no accounts, no subscriptions, and zero tracking cookies.',
      '100% open-source TypeScript & Node.js codebase published under MIT license.'
    ]
  }
];

export function ProtocolMatrix() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full border-2 border-zinc-950 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-6 sm:p-8 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.85)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-zinc-950 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
              SECURITY SPECIFICATION // v1.0
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            Cryptographic Architecture Matrix
          </h2>
        </div>
        <div className="text-[11px] text-zinc-500 self-start sm:self-center">
          [ 4 VERIFIED SECURITY PILLARS ]
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PILLARS.map((pillar) => {
          const isExpanded = expandedId === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => toggleExpand(pillar.id)}
              className={`p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isExpanded
                  ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]'
                  : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-950 dark:hover:border-zinc-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {pillar.tag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-400 dark:border-zinc-700">
                    {pillar.badge}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                      {pillar.summary}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                    {pillar.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {isExpanded ? 'Collapse technical specs' : 'Inspect cryptographic specs'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-zinc-950 dark:text-zinc-100' : ''
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
