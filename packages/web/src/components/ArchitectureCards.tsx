import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Shield, Cpu, Network } from 'lucide-react';

interface NoteItem {
  number: string;
  title: string;
  summary: string;
  details: string;
  readTime: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NOTES: NoteItem[] = [
  {
    number: '01',
    title: 'Direct Peer-to-Peer Transfer',
    summary: 'WebRTC data channels route packets directly between sender and receiver without intermediary disk writes.',
    details: 'Droply attempts a direct DTLS/SCTP connection using WebRTC. Once ICE candidates negotiate, file chunks flow directly device-to-device at maximum local network or WAN speeds.',
    readTime: '2 min read',
    icon: Network
  },
  {
    number: '02',
    title: 'Zero-Knowledge PAKE Handshake',
    summary: 'Pairing codes authenticate ECDH key exchange without ever transmitting the secret key over the wire.',
    details: 'Even if traffic passes through a signaling relay due to symmetric NATs or firewalls, the server sees only ciphertext. Session keys are derived locally using SPAKE2-inspired PBKDF2 + ECDH P-256 and authenticated with HMAC-SHA256.',
    readTime: '3 min read',
    icon: Shield
  },
  {
    number: '03',
    title: 'Cross-Platform CLI & Browser Interop',
    summary: 'Send files from terminal to iPhone, Android to Linux laptop, or Mac to Windows with the same code.',
    details: 'The Droply Go/Node/Web protocol specification ensures full wire compatibility. The Droply CLI binary runs anywhere with zero runtime dependencies and connects seamlessly with Droply Web.',
    readTime: '2 min read',
    icon: Cpu
  }
];

export function ArchitectureCards() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="w-full border border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
          Notes & Architecture
        </p>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
            What happens after you press Send?
          </h2>
          <span className="font-mono text-xs text-zinc-500">
            Plainspoken security guide
          </span>
        </div>
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Plainspoken notes about the signaling relay, the memorable pairing code, and the ways browsers and terminals meet.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NOTES.map((note, i) => {
          const isExpanded = expandedIndex === i;
          const Icon = note.icon;

          return (
            <div
              key={note.number}
              onClick={() => toggleExpand(i)}
              className={`p-5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between select-none ${
                isExpanded
                  ? 'border-zinc-500 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900/90'
                  : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
                  <span className="font-mono text-xs font-bold">{note.number}</span>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <Icon className="w-3.5 h-3.5" />
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <h3 className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {note.title}
                </h3>

                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {isExpanded ? note.details : note.summary}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                {note.readTime}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
