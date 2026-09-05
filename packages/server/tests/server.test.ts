import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { WebSocket } from 'ws';
import { createDroplyServer } from '../src/index.js';

describe('Signaling & Relay Server', () => {
  let serverInstance: ReturnType<typeof createDroplyServer>;
  let port: number;
  let wsUrl: string;

  beforeAll(async () => {
    serverInstance = createDroplyServer();
    port = await serverInstance.listen(0, '127.0.0.1');
    wsUrl = `ws://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await serverInstance.close();
  });

  it('responds to health check endpoint', async () => {
    const res = await new Promise<{ status: string; activeRooms: number }>((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/healthz`, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    expect(res.status).toBe('ok');
    expect(typeof res.activeRooms).toBe('number');
  });

  it('coordinates pairing and notifies peers upon rendezvous', async () => {
    const code = '3-azure-falcon';

    const senderWs = new WebSocket(wsUrl);
    const receiverWs = new WebSocket(wsUrl);

    await Promise.all([
      new Promise(res => senderWs.on('open', res)),
      new Promise(res => receiverWs.on('open', res))
    ]);

    const senderMessages: any[] = [];
    const receiverMessages: any[] = [];
    let receivedBinary: Buffer | null = null;

    senderWs.on('message', (data, isBinary) => {
      if (!isBinary) {
        try { senderMessages.push(JSON.parse(data.toString())); } catch {}
      }
    });

    receiverWs.on('message', (data, isBinary) => {
      if (isBinary) {
        receivedBinary = data as Buffer;
      } else {
        try { receiverMessages.push(JSON.parse(data.toString())); } catch {}
      }
    });

    // Sender joins first
    senderWs.send(JSON.stringify({ type: 'join', code, role: 'sender' }));

    // Receiver joins
    receiverWs.send(JSON.stringify({ type: 'join', code, role: 'receiver' }));

    // Wait for rendezvous messages
    await new Promise(r => setTimeout(r, 100));

    expect(senderMessages).toContainEqual({ type: 'peer-joined', role: 'receiver' });
    expect(receiverMessages).toContainEqual({ type: 'peer-joined', role: 'sender' });

    // Test SDP forwarding
    senderWs.send(JSON.stringify({ type: 'sdp-offer', sdp: { mock: 'offer' } }));
    await new Promise(r => setTimeout(r, 100));
    expect(receiverMessages).toContainEqual({ type: 'sdp-offer', sdp: { mock: 'offer' } });

    // Test relay fallback & binary chunk forwarding
    senderWs.send(JSON.stringify({ type: 'relay-fallback' }));
    await new Promise(r => setTimeout(r, 100));
    expect(receiverMessages).toContainEqual({ type: 'relay-fallback' });

    const testChunk = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
    senderWs.send(testChunk, { binary: true });

    await new Promise(r => setTimeout(r, 100));
    expect(receivedBinary).not.toBeNull();
    expect(Array.from(receivedBinary!)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

    // Cleanup sockets
    senderWs.close();
    receiverWs.close();
    await new Promise(r => setTimeout(r, 50));
  });
});
