import type { WebSocket, RawData } from 'ws';

/**
 * Zero-Knowledge Encrypted Relay
 * Forwards encrypted chunk envelopes and control messages between paired peers
 * without inspecting or storing any contents.
 */
export class RelayManager {
  forward(targetWs: WebSocket, data: RawData, isBinary: boolean): boolean {
    if (targetWs.readyState !== 1 /* OPEN */) {
      return false;
    }

    try {
      targetWs.send(data, { binary: isBinary });
      return true;
    } catch {
      return false;
    }
  }
}
