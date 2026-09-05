import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDroplyServer } from '@droply/server';
import { sha256, Manifest } from '@droply/protocol';
import { DroplyClient } from '../src/client.js';

describe('CLI Transfer Client E2E', () => {
  let serverInstance: ReturnType<typeof createDroplyServer>;
  let wsUrl: string;

  beforeAll(async () => {
    serverInstance = createDroplyServer();
    const port = await serverInstance.listen(0, '127.0.0.1');
    wsUrl = `ws://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await serverInstance.close();
  });

  it('transfers encrypted multi-chunk file and verifies SHA-256 integrity', async () => {
    const code = '8-cobalt-falcon';

    // 200 KB test payload (spans 4 chunks: 64KB, 64KB, 64KB, 8KB)
    const testData = new Uint8Array(200 * 1024);
    for (let i = 0; i < testData.byteLength; i++) {
      testData[i] = i % 256;
    }
    const expectedHash = await sha256(testData);

    const manifest: Manifest = {
      transferId: 'test-transfer-1',
      payloadType: 'file',
      files: [{
        id: 'file-0',
        path: 'data.bin',
        size: testData.byteLength,
        sha256: expectedHash
      }],
      totalBytes: testData.byteLength
    };

    const receivedFiles: Array<{ id: string; length: number; data: Uint8Array }> = [];

    const sender = new DroplyClient(wsUrl, code, 'sender');
    const receiver = new DroplyClient(wsUrl, code, 'receiver', {
      onManifestReceived: async () => true // auto-accept
    });

    await Promise.all([sender.connect(), receiver.connect()]);
    await Promise.all([sender.performHandshake(), receiver.performHandshake()]);

    const receivePromise = receiver.receivePayload(async (fileId, filePath, data) => {
      receivedFiles.push({ id: fileId, length: data.byteLength, data });
    });

    const sendPromise = sender.sendPayload(manifest, async () => testData);

    await Promise.all([sendPromise, receivePromise]);

    expect(receivedFiles.length).toBe(1);
    expect(receivedFiles[0].length).toBe(testData.byteLength);

    const receivedHash = await sha256(receivedFiles[0].data);
    expect(receivedHash).toBe(expectedHash);

    sender.close();
    receiver.close();
  });
});
