import { WebSocket } from 'ws';
import {
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
  PeerControlMessage,
  encodeControlMessage,
  decodeControlMessage,
  Role,
  CHUNK_SIZE
} from '@droply/protocol';

export interface ClientCallbacks {
  onStatus?: (status: string) => void;
  onPeerJoined?: () => void;
  onManifestReceived?: (manifest: Manifest) => Promise<boolean>;
  onProgress?: (bytes: number, total: number, speed: number, eta: number) => void;
  onError?: (err: Error) => void;
  onComplete?: () => void;
}

export class DroplyClient {
  private ws!: WebSocket;
  private sessionKey?: CryptoKey;
  private authTag?: string;

  constructor(
    private serverUrl: string,
    private code: string,
    private role: Role,
    private callbacks: ClientCallbacks = {}
  ) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.callbacks.onStatus?.('Connecting to signaling server...');
      this.ws = new WebSocket(this.serverUrl);

      this.ws.on('open', () => {
        resolve();
      });

      this.ws.on('error', (err) => {
        this.callbacks.onError?.(err);
        reject(err);
      });
    });
  }

  async performHandshake(): Promise<void> {
    const keyPair = await generateKeyPair();

    return new Promise((resolve, reject) => {
      let resolved = false;

      const messageHandler = async (data: any, isBinary: boolean) => {
        if (isBinary) return;

        try {
          const raw = data.toString('utf-8');
          const msg = JSON.parse(raw);

          // 1. Peer joined: Sender initiates handshake
          if (msg.type === 'peer-joined') {
            this.callbacks.onStatus?.('Peer joined! Initiating Zero-Knowledge Handshake...');
            this.callbacks.onPeerJoined?.();
            if (this.role === 'sender') {
              const helloMsg: PeerControlMessage = {
                type: 'handshake-hello',
                rawPublicKeyHex: bytesToHex(keyPair.rawPublicKey),
                role: this.role
              };
              this.ws.send(encodeControlMessage(helloMsg));
            }
            return;
          }

          // 2. Hello received from peer
          if (msg.type === 'handshake-hello') {
            const peerPublicKey = await importPeerPublicKey(hexToBytes(msg.rawPublicKeyHex));
            const derivation = await deriveSessionKey(keyPair.privateKey, peerPublicKey, this.code);
            this.sessionKey = derivation.sessionKey;
            this.authTag = derivation.authTag;

            if (this.role === 'receiver') {
              // Reply with receiver's public key
              const helloReply: PeerControlMessage = {
                type: 'handshake-hello',
                rawPublicKeyHex: bytesToHex(keyPair.rawPublicKey),
                role: this.role
              };
              this.ws.send(encodeControlMessage(helloReply));
            } else {
              // Sender has now received receiver's public key, both have derived their keys!
              // Sender sends confirm to receiver
              const confirmMsg: PeerControlMessage = {
                type: 'handshake-confirm',
                authTag: this.authTag!
              };
              this.ws.send(encodeControlMessage(confirmMsg));
            }
            return;
          }

          // 3. Confirm auth tag
          if (msg.type === 'handshake-confirm') {
            if (msg.authTag !== this.authTag) {
              const err = new Error('Authentication failed: Pairing codes do not match');
              this.callbacks.onError?.(err);
              this.ws.off('message', messageHandler);
              reject(err);
              return;
            }

            // If receiver, confirm back to sender
            if (this.role === 'receiver') {
              const confirmReply: PeerControlMessage = {
                type: 'handshake-confirm',
                authTag: this.authTag!
              };
              this.ws.send(encodeControlMessage(confirmReply));
            }

            this.callbacks.onStatus?.('Zero-Knowledge E2EE channel established!');
            this.ws.off('message', messageHandler);
            resolved = true;
            resolve();
            return;
          }
        } catch (err: any) {
          if (!resolved) {
            this.ws.off('message', messageHandler);
            reject(err);
          }
        }
      };

      // Attach message handler BEFORE sending join
      this.ws.on('message', messageHandler);

      this.callbacks.onStatus?.('Joining room with code: ' + this.code);
      this.ws.send(JSON.stringify({ type: 'join', code: this.code, role: this.role }));
    });
  }

  async sendPayload(manifest: Manifest, getFileData: (fileId: string) => Promise<Uint8Array>): Promise<void> {
    if (!this.sessionKey) throw new Error('Cannot send: Session key not established');

    const manifestMsg: PeerControlMessage = { type: 'manifest', manifest };
    this.ws.send(encodeControlMessage(manifestMsg));
    this.callbacks.onStatus?.('Waiting for receiver confirmation...');

    await new Promise<void>((resolve, reject) => {
      const consentHandler = (data: any, isBinary: boolean) => {
        if (isBinary) return;
        try {
          const msg = JSON.parse(data.toString('utf-8'));
          if (msg.type === 'consent') {
            this.ws.off('message', consentHandler);
            if (msg.accepted) {
              resolve();
            } else {
              reject(new Error(`Receiver rejected transfer: ${msg.reason || 'User declined'}`));
            }
          }
        } catch {}
      };
      this.ws.on('message', consentHandler);
    });

    this.callbacks.onStatus?.('Transfer accepted! Streaming data...');
    const tracker = new SpeedTracker(manifest.totalBytes);
    let totalBytesSent = 0;
    let globalChunkIndex = 0;

    for (const file of manifest.files) {
      const fileData = await getFileData(file.id);
      for (const chunk of sliceIntoChunks(fileData, CHUNK_SIZE)) {
        const encryptedEnvelope = await encryptChunk(this.sessionKey, globalChunkIndex++, chunk);

        while (this.ws.bufferedAmount > 1024 * 1024) {
          await new Promise(r => setTimeout(r, 10));
        }

        this.ws.send(encryptedEnvelope, { binary: true });
        totalBytesSent += chunk.byteLength;

        const metrics = tracker.update(totalBytesSent);
        this.callbacks.onProgress?.(totalBytesSent, manifest.totalBytes, metrics.speed, metrics.eta);
      }
    }

    const completeMsg: PeerControlMessage = { type: 'transfer-complete', transferId: manifest.transferId };
    this.ws.send(encodeControlMessage(completeMsg));
    this.callbacks.onComplete?.();
  }

  async receivePayload(
    onFileReceived: (fileId: string, path: string, data: Uint8Array) => Promise<void>
  ): Promise<Manifest> {
    if (!this.sessionKey) throw new Error('Cannot receive: Session key not established');

    const manifest = await new Promise<Manifest>((resolve) => {
      const manifestHandler = (data: any, isBinary: boolean) => {
        if (isBinary) return;
        try {
          const msg = JSON.parse(data.toString('utf-8'));
          if (msg.type === 'manifest') {
            this.ws.off('message', manifestHandler);
            resolve(msg.manifest);
          }
        } catch {}
      };
      this.ws.on('message', manifestHandler);
    });

    const accepted = this.callbacks.onManifestReceived 
      ? await this.callbacks.onManifestReceived(manifest)
      : true;

    if (!accepted) {
      const rejectMsg: PeerControlMessage = { type: 'consent', accepted: false, reason: 'Declined by user' };
      this.ws.send(encodeControlMessage(rejectMsg));
      throw new Error('Transfer declined by user');
    }

    const acceptMsg: PeerControlMessage = { type: 'consent', accepted: true };
    this.ws.send(encodeControlMessage(acceptMsg));
    this.callbacks.onStatus?.('Receiving files...');

    const tracker = new SpeedTracker(manifest.totalBytes);
    let totalBytesReceived = 0;
    let currentFileIndex = 0;
    let currentFileChunks: Uint8Array[] = [];
    let currentFileBytes = 0;

    await new Promise<void>((resolve, reject) => {
      const queue: Array<{ data: any; isBinary: boolean }> = [];
      let isDraining = false;

      const processQueue = async () => {
        if (isDraining) return;
        isDraining = true;

        while (queue.length > 0) {
          const { data, isBinary } = queue.shift()!;

          if (!isBinary) {
            try {
              const msg = JSON.parse(data.toString('utf-8'));
              if (msg.type === 'transfer-complete') {
                if (currentFileChunks.length > 0 && currentFileIndex < manifest.files.length) {
                  const fileEntry = manifest.files[currentFileIndex];
                  const fullBuffer = concatBuffers(currentFileChunks);
                  await onFileReceived(fileEntry.id, fileEntry.path, fullBuffer);
                  currentFileChunks = [];
                }
                this.ws.off('message', onSocketMessage);
                this.callbacks.onComplete?.();
                resolve();
                return;
              }
            } catch {}
            continue;
          }

          try {
            const envelope = new Uint8Array(data);
            const decrypted = await decryptChunk(this.sessionKey!, envelope);
            currentFileChunks.push(decrypted.plaintext);
            currentFileBytes += decrypted.plaintext.byteLength;
            totalBytesReceived += decrypted.plaintext.byteLength;

            const metrics = tracker.update(totalBytesReceived);
            this.callbacks.onProgress?.(totalBytesReceived, manifest.totalBytes, metrics.speed, metrics.eta);

            const currentFile = manifest.files[currentFileIndex];
            if (currentFile && currentFileBytes >= currentFile.size) {
              const fullBuffer = concatBuffers(currentFileChunks);
              await onFileReceived(currentFile.id, currentFile.path, fullBuffer);
              currentFileIndex++;
              currentFileChunks = [];
              currentFileBytes = 0;
            }
          } catch (err: any) {
            this.ws.off('message', onSocketMessage);
            reject(err);
            return;
          }
        }

        isDraining = false;
      };

      const onSocketMessage = (data: any, isBinary: boolean) => {
        queue.push({ data, isBinary });
        processQueue();
      };

      this.ws.on('message', onSocketMessage);
    });

    return manifest;
  }

  close() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    } catch {}
  }
}

function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((acc, b) => acc + b.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.byteLength;
  }
  return result;
}

export { DroplyClient as DirectClient };

