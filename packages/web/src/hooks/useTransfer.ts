import { useState, useRef, useCallback } from 'react';
import {
  generatePairingCode,
  generateKeyPair,
  importPeerPublicKey,
  deriveSessionKey,
  encryptChunk,
  decryptChunk,
  sha256,
  bytesToHex,
  hexToBytes,
  sliceIntoChunks,
  SpeedTracker,
  Manifest,
  FileEntry,
  PeerControlMessage,
  encodeControlMessage,
  CHUNK_SIZE
} from '@droply/protocol';

export type TransferStatus =
  | 'idle'
  | 'connecting'
  | 'waiting-for-peer'
  | 'handshaking'
  | 'awaiting-consent'
  | 'transferring'
  | 'completed'
  | 'error';

export interface TransferMetrics {
  progress: number;
  speed: number;
  eta: number;
  bytesTransferred: number;
  totalBytes: number;
}

export function getEffectiveSignalingUrl(custom?: string): string {
  if (custom && custom.trim()) {
    let url = custom.trim();
    if (url.startsWith('http://')) {
      url = url.replace(/^http:\/\//, 'ws://');
    } else if (url.startsWith('https://')) {
      url = url.replace(/^https:\/\//, 'wss://');
    } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      url = `${proto}${url}`;
    }
    return url;
  }

  const envUrl = (import.meta as any).env?.VITE_SIGNALING_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();

  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('droply_server_url') || localStorage.getItem('direct_server_url')
    : null;
  if (stored && stored.trim()) return stored.trim();

  // If on GitHub Pages and no custom server is configured, don't return a nonexistent wss://github.io URL
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return '';
  }

  if (typeof window !== 'undefined') {
    const loc = window.location;
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${loc.host}`;
  }

  return 'ws://localhost:3000';
}

export function useTransfer() {
  const [status, setStatus] = useState<TransferStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [metrics, setMetrics] = useState<TransferMetrics>({
    progress: 0,
    speed: 0,
    eta: 0,
    bytesTransferred: 0,
    totalBytes: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const sessionKeyRef = useRef<CryptoKey | null>(null);
  const consentResolverRef = useRef<((accept: boolean) => void) | null>(null);

  const reset = useCallback(() => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    sessionKeyRef.current = null;
    consentResolverRef.current = null;
    setStatus('idle');
    setStatusMessage('');
    setPairingCode('');
    setManifest(null);
    setMetrics({ progress: 0, speed: 0, eta: 0, bytesTransferred: 0, totalBytes: 0 });
  }, []);

  const startSend = useCallback(async (files: File[], textSnippet?: string, customServerUrl?: string) => {
    try {
      reset();
      setStatus('connecting');
      setStatusMessage('Preparing payload and generating keys...');

      const code = generatePairingCode();
      setPairingCode(code);

      // 1. Build manifest
      const fileEntries: FileEntry[] = [];
      let totalBytes = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = new Uint8Array(await file.arrayBuffer());
        const hash = await sha256(buffer);
        totalBytes += file.size;

        fileEntries.push({
          id: `file-${i}`,
          path: (file as any).webkitRelativePath || file.name,
          size: file.size,
          mimeType: file.type,
          sha256: hash
        });
      }

      if (textSnippet) {
        const textBuf = new TextEncoder().encode(textSnippet);
        totalBytes += textBuf.byteLength;
        fileEntries.push({
          id: 'text-snippet',
          path: 'message.txt',
          size: textBuf.byteLength,
          mimeType: 'text/plain',
          sha256: await sha256(textBuf)
        });
      }

      const transferManifest: Manifest = {
        transferId: `transfer-${Date.now()}`,
        payloadType: textSnippet && files.length === 0 ? 'text' : files.length > 1 ? 'directory' : 'file',
        files: fileEntries,
        totalBytes,
        textSnippet
      };
      setManifest(transferManifest);

      // 2. Connect WebSocket
      const serverWsUrl = getEffectiveSignalingUrl(customServerUrl);
      if (!serverWsUrl) {
        throw new Error(
          'No signaling server configured. GitHub Pages is a static host and requires a secure signaling server (wss://). Click the Settings (⚙) icon in the top right to configure your endpoint, or run "droply serve" locally.'
        );
      }
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && serverWsUrl.startsWith('ws://')) {
        throw new Error(
          `Insecure WebSocket (${serverWsUrl}) is blocked on HTTPS pages by browser Mixed Content security. Please configure a secure "wss://" endpoint with SSL, or access Droply over HTTP.`
        );
      }
      const ws = new WebSocket(serverWsUrl);
      wsRef.current = ws;

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          setStatus('waiting-for-peer');
          setStatusMessage('Waiting for recipient to connect...');
          ws.send(JSON.stringify({ type: 'join', code, role: 'sender' }));
          resolve();
        };
        ws.onerror = () => reject(new Error(`Failed to connect to signaling server at ${serverWsUrl}`));
      });

      // 3. Handshake
      const keyPair = await generateKeyPair();
      let sessionKey: CryptoKey | null = null;
      let authTag: string | null = null;

      await new Promise<void>((resolve, reject) => {
        ws.onmessage = async (event) => {
          if (typeof event.data !== 'string') return;
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'peer-joined') {
              setStatus('handshaking');
              setStatusMessage('Recipient connected! Performing Zero-Knowledge handshake...');
              const hello: PeerControlMessage = {
                type: 'handshake-hello',
                rawPublicKeyHex: bytesToHex(keyPair.rawPublicKey),
                role: 'sender'
              };
              ws.send(encodeControlMessage(hello));
            } else if (msg.type === 'handshake-hello') {
              const peerPubKey = await importPeerPublicKey(hexToBytes(msg.rawPublicKeyHex));
              const derived = await deriveSessionKey(keyPair.privateKey, peerPubKey, code);
              sessionKey = derived.sessionKey;
              authTag = derived.authTag;
              sessionKeyRef.current = sessionKey;

              const confirm: PeerControlMessage = { type: 'handshake-confirm', authTag };
              ws.send(encodeControlMessage(confirm));
            } else if (msg.type === 'handshake-confirm') {
              if (msg.authTag === authTag) {
                resolve();
              } else {
                reject(new Error('Pairing code mismatch'));
              }
            }
          } catch (e) {
            reject(e);
          }
        };
      });

      // 4. Send manifest and wait for consent
      setStatus('awaiting-consent');
      setStatusMessage('Waiting for recipient to accept...');
      ws.send(encodeControlMessage({ type: 'manifest', manifest: transferManifest }));

      await new Promise<void>((resolve, reject) => {
        const handler = (event: MessageEvent) => {
          if (typeof event.data !== 'string') return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'consent') {
              ws.removeEventListener('message', handler);
              if (msg.accepted) {
                resolve();
              } else {
                reject(new Error('Recipient declined transfer'));
              }
            }
          } catch {}
        };
        ws.addEventListener('message', handler);
      });

      // 5. Stream encrypted chunks
      setStatus('transferring');
      setStatusMessage('Transfer in progress...');
      const tracker = new SpeedTracker(totalBytes);
      let totalSent = 0;
      let globalChunkIndex = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const buffer = new Uint8Array(await file.arrayBuffer());
        for (const chunk of sliceIntoChunks(buffer, CHUNK_SIZE)) {
          const envelope = await encryptChunk(sessionKey!, globalChunkIndex++, chunk);
          while (ws.bufferedAmount > 1024 * 1024) {
            await new Promise(r => setTimeout(r, 10));
          }
          ws.send(envelope);
          totalSent += chunk.byteLength;
          const metric = tracker.update(totalSent);
          setMetrics({
            progress: metric.percentage,
            speed: metric.speed,
            eta: metric.eta,
            bytesTransferred: totalSent,
            totalBytes
          });
        }
      }

      if (textSnippet) {
        const textBuf = new TextEncoder().encode(textSnippet);
        for (const chunk of sliceIntoChunks(textBuf, CHUNK_SIZE)) {
          const envelope = await encryptChunk(sessionKey!, globalChunkIndex++, chunk);
          ws.send(envelope);
          totalSent += chunk.byteLength;
          const metric = tracker.update(totalSent);
          setMetrics({
            progress: metric.percentage,
            speed: metric.speed,
            eta: metric.eta,
            bytesTransferred: totalSent,
            totalBytes
          });
        }
      }

      ws.send(encodeControlMessage({ type: 'transfer-complete', transferId: transferManifest.transferId }));
      setStatus('completed');
      setStatusMessage('Transfer completed successfully!');
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Transfer failed');
    }
  }, [reset]);

  const startReceive = useCallback(async (code: string, customServerUrl?: string) => {
    try {
      reset();
      setStatus('connecting');
      setStatusMessage('Connecting to sender...');
      setPairingCode(code);

      const serverWsUrl = getEffectiveSignalingUrl(customServerUrl);
      if (!serverWsUrl) {
        throw new Error(
          'No signaling server configured. GitHub Pages is a static host and requires a secure signaling server (wss://). Click the Settings (⚙) icon in the top right to configure your endpoint, or run "droply serve" locally.'
        );
      }
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && serverWsUrl.startsWith('ws://')) {
        throw new Error(
          `Insecure WebSocket (${serverWsUrl}) is blocked on HTTPS pages by browser Mixed Content security. Please configure a secure "wss://" endpoint with SSL, or access Droply over HTTP.`
        );
      }
      const ws = new WebSocket(serverWsUrl);
      wsRef.current = ws;

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'join', code, role: 'receiver' }));
          resolve();
        };
        ws.onerror = () => reject(new Error(`Failed to connect to signaling server at ${serverWsUrl}`));
      });

      // Handshake
      const keyPair = await generateKeyPair();
      let sessionKey: CryptoKey | null = null;
      let authTag: string | null = null;

      await new Promise<void>((resolve, reject) => {
        ws.onmessage = async (event) => {
          if (typeof event.data !== 'string') return;
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'peer-joined') {
              setStatus('handshaking');
              setStatusMessage('Sender found! Negotiating E2EE keys...');
              const hello: PeerControlMessage = {
                type: 'handshake-hello',
                rawPublicKeyHex: bytesToHex(keyPair.rawPublicKey),
                role: 'receiver'
              };
              ws.send(encodeControlMessage(hello));
            } else if (msg.type === 'handshake-hello') {
              const peerPubKey = await importPeerPublicKey(hexToBytes(msg.rawPublicKeyHex));
              const derived = await deriveSessionKey(keyPair.privateKey, peerPubKey, code);
              sessionKey = derived.sessionKey;
              authTag = derived.authTag;
              sessionKeyRef.current = sessionKey;

              const confirm: PeerControlMessage = { type: 'handshake-confirm', authTag };
              ws.send(encodeControlMessage(confirm));
            } else if (msg.type === 'handshake-confirm') {
              if (msg.authTag === authTag) {
                resolve();
              } else {
                reject(new Error('Pairing code mismatch'));
              }
            }
          } catch (e) {
            reject(e);
          }
        };
      });

      // Wait for manifest
      setStatus('awaiting-consent');
      setStatusMessage('Waiting for transfer details...');
      const receivedManifest = await new Promise<Manifest>((resolve) => {
        const handler = (event: MessageEvent) => {
          if (typeof event.data !== 'string') return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'manifest') {
              ws.removeEventListener('message', handler);
              resolve(msg.manifest);
            }
          } catch {}
        };
        ws.addEventListener('message', handler);
      });
      setManifest(receivedManifest);

      // Await user consent from UI
      const userConsent = await new Promise<boolean>((resolve) => {
        consentResolverRef.current = resolve;
      });

      if (!userConsent) {
        ws.send(encodeControlMessage({ type: 'consent', accepted: false, reason: 'Declined by recipient' }));
        reset();
        return;
      }

      ws.send(encodeControlMessage({ type: 'consent', accepted: true }));
      setStatus('transferring');
      setStatusMessage('Downloading payload...');

      // Receive chunks
      const tracker = new SpeedTracker(receivedManifest.totalBytes);
      let totalReceived = 0;
      let currentFileIndex = 0;
      let currentChunks: Uint8Array[] = [];
      let currentBytes = 0;

      const receivedBlobs: Array<{ name: string; blob: Blob }> = [];

      await new Promise<void>((resolve, reject) => {
        ws.onmessage = async (event) => {
          if (typeof event.data === 'string') {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'transfer-complete') {
                if (currentChunks.length > 0 && currentFileIndex < receivedManifest.files.length) {
                  const entry = receivedManifest.files[currentFileIndex];
                  const fullBuf = concatBuffers(currentChunks);
                  receivedBlobs.push({
                    name: entry.path,
                    blob: new Blob([fullBuf as unknown as BlobPart], { type: entry.mimeType || 'application/octet-stream' })
                  });
                }
                resolve();
              }
            } catch {}
            return;
          }

          try {
            const rawBuffer = new Uint8Array(await event.data.arrayBuffer());
            const decrypted = await decryptChunk(sessionKey!, rawBuffer);
            currentChunks.push(decrypted.plaintext);
            currentBytes += decrypted.plaintext.byteLength;
            totalReceived += decrypted.plaintext.byteLength;

            const metric = tracker.update(totalReceived);
            setMetrics({
              progress: metric.percentage,
              speed: metric.speed,
              eta: metric.eta,
              bytesTransferred: totalReceived,
              totalBytes: receivedManifest.totalBytes
            });

            const currentFile = receivedManifest.files[currentFileIndex];
            if (currentFile && currentBytes >= currentFile.size) {
              const fullBuf = concatBuffers(currentChunks);
              receivedBlobs.push({
                name: currentFile.path,
                blob: new Blob([fullBuf as unknown as BlobPart], { type: currentFile.mimeType || 'application/octet-stream' })
              });
              currentFileIndex++;
              currentChunks = [];
              currentBytes = 0;
            }
          } catch (err) {
            reject(err);
          }
        };
      });

      // Trigger automatic downloads
      for (const item of receivedBlobs) {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setStatus('completed');
      setStatusMessage(`All ${receivedBlobs.length} file(s) received and verified!`);
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Transfer failed');
    }
  }, [reset]);

  const acceptTransfer = useCallback(() => {
    if (consentResolverRef.current) {
      consentResolverRef.current(true);
      consentResolverRef.current = null;
    }
  }, []);

  const rejectTransfer = useCallback(() => {
    if (consentResolverRef.current) {
      consentResolverRef.current(false);
      consentResolverRef.current = null;
    }
  }, []);

  return {
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
  };
}

function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((acc, b) => acc + b.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(b, offset);
    offset += b.byteLength;
  }
  return out;
}
