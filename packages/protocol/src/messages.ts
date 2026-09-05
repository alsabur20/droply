/**
 * Droply Wire Protocol Messages & Schemas
 */

export type Role = 'sender' | 'receiver';
export type PayloadType = 'file' | 'directory' | 'text';

export interface FileEntry {
  id: string;
  path: string;           // Relative path (e.g. "my-folder/sub/doc.pdf" or "image.png")
  size: number;           // File size in bytes
  mimeType?: string;
  sha256?: string;        // SHA-256 hash for integrity verification
}

export interface Manifest {
  transferId: string;
  payloadType: PayloadType;
  files: FileEntry[];
  totalBytes: number;
  textSnippet?: string;   // For raw clipboard / text snippet sharing
}

// Messages exchanged during signaling (via WebSocket server)
export type SignalingMessage =
  | { type: 'join'; code: string; role: Role }
  | { type: 'peer-joined'; role: Role }
  | { type: 'peer-left' }
  | { type: 'sdp-offer'; sdp: any }
  | { type: 'sdp-answer'; sdp: any }
  | { type: 'ice-candidate'; candidate: any }
  | { type: 'relay-fallback' }
  | { type: 'relay-data'; data: string } // Base64 encoded or forwarded
  | { type: 'error'; message: string };

// Messages exchanged directly between peers (via WebRTC DataChannel or Relay)
export type PeerControlMessage =
  | { type: 'handshake-hello'; rawPublicKeyHex: string; role: Role }
  | { type: 'handshake-confirm'; authTag: string }
  | { type: 'manifest'; manifest: Manifest }
  | { type: 'consent'; accepted: boolean; reason?: string }
  | { type: 'chunk-ack'; chunkIndex: number; totalReceived: number }
  | { type: 'file-complete'; fileId: string; sha256: string }
  | { type: 'transfer-complete'; transferId: string }
  | { type: 'transfer-cancel'; reason: string };

export function encodeControlMessage(msg: PeerControlMessage): string {
  return JSON.stringify(msg);
}

export function decodeControlMessage(text: string): PeerControlMessage {
  return JSON.parse(text) as PeerControlMessage;
}
