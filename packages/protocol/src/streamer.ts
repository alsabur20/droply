/**
 * Droply Streamer & Flow Control
 * Manages 64KB chunk streaming, backpressure, and integrity tracking
 */

export const CHUNK_SIZE = 64 * 1024; // 64 KB

export interface ChunkEnvelope {
  chunkIndex: number;
  totalChunks: number;
  fileId: string;
  data: Uint8Array;
}

export interface ProgressReport {
  fileId: string;
  filePath: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  bytesPerSecond: number;
  etaSeconds: number;
}

/**
 * Calculates current transfer speed and estimated time of arrival (ETA)
 */
export class SpeedTracker {
  private startTime: number = Date.now();
  private lastTime: number = Date.now();
  private lastBytes: number = 0;
  private currentSpeed: number = 0; // bytes/sec

  constructor(public totalBytes: number) {}

  update(currentBytes: number): { speed: number; eta: number; percentage: number } {
    const now = Date.now();
    const elapsedSinceLast = (now - this.lastTime) / 1000;

    if (elapsedSinceLast >= 0.5) {
      const bytesDelta = currentBytes - this.lastBytes;
      this.currentSpeed = bytesDelta / elapsedSinceLast;
      this.lastBytes = currentBytes;
      this.lastTime = now;
    }

    const percentage = this.totalBytes > 0 
      ? Math.min(100, Math.round((currentBytes / this.totalBytes) * 1000) / 10)
      : 100;

    const remainingBytes = Math.max(0, this.totalBytes - currentBytes);
    const eta = this.currentSpeed > 0 ? Math.ceil(remainingBytes / this.currentSpeed) : 0;

    return {
      speed: this.currentSpeed,
      eta,
      percentage
    };
  }

  getAverageSpeed(finalBytes: number): number {
    const totalElapsed = (Date.now() - this.startTime) / 1000;
    return totalElapsed > 0 ? finalBytes / totalElapsed : 0;
  }
}

/**
 * Splits a byte buffer into 64KB chunks
 */
export function* sliceIntoChunks(data: Uint8Array, chunkSize: number = CHUNK_SIZE): Generator<Uint8Array> {
  let offset = 0;
  while (offset < data.byteLength) {
    const end = Math.min(offset + chunkSize, data.byteLength);
    yield data.subarray(offset, end);
    offset = end;
  }
}

/**
 * Calculates total chunks for a given byte size
 */
export function calculateTotalChunks(size: number, chunkSize: number = CHUNK_SIZE): number {
  if (size === 0) return 1;
  return Math.ceil(size / chunkSize);
}
