import { describe, it, expect } from 'vitest';
import {
  generatePairingCode,
  generatePinCode,
  isValidCode,
  normalizeCode,
  generateKeyPair,
  importPeerPublicKey,
  deriveSessionKey,
  encryptChunk,
  decryptChunk,
  sha256,
  sliceIntoChunks,
  SpeedTracker
} from '../src/index.js';

describe('Protocol Cryptographic Engine', () => {
  it('generates valid readable pairing codes', () => {
    const code = generatePairingCode();
    expect(code).toMatch(/^[1-9]-[a-z]+-[a-z]+$/);
    expect(isValidCode(code)).toBe(true);
  });

  it('generates valid numeric PIN codes', () => {
    const pin = generatePinCode();
    expect(pin).toMatch(/^[0-9]{3}-[0-9]{3}$/);
    expect(isValidCode(pin)).toBe(true);
  });

  it('correctly validates and normalizes codes', () => {
    expect(isValidCode('  4-Cosmic-Falcon  ')).toBe(true);
    expect(normalizeCode('  4-Cosmic-Falcon  ')).toBe('4-cosmic-falcon');
    expect(isValidCode('invalid_code_with_underscore')).toBe(false);
  });

  it('derives matching session keys and auth tags for peers with same code', async () => {
    const code = '7-amber-horizon';

    // Alice generates key pair
    const aliceKeys = await generateKeyPair();
    // Bob generates key pair
    const bobKeys = await generateKeyPair();

    // Alice imports Bob's public key
    const alicePeerBobKey = await importPeerPublicKey(bobKeys.rawPublicKey);
    const aliceSession = await deriveSessionKey(aliceKeys.privateKey, alicePeerBobKey, code);

    // Bob imports Alice's public key
    const bobPeerAliceKey = await importPeerPublicKey(aliceKeys.rawPublicKey);
    const bobSession = await deriveSessionKey(bobKeys.privateKey, bobPeerAliceKey, code);

    // Auth tags must be identical
    expect(aliceSession.authTag).toBe(bobSession.authTag);
    expect(aliceSession.authTag.length).toBe(32); // 128-bit hex string
  });

  it('fails auth tag match if peers use different codes', async () => {
    const aliceKeys = await generateKeyPair();
    const bobKeys = await generateKeyPair();

    const alicePeerKey = await importPeerPublicKey(bobKeys.rawPublicKey);
    const aliceSession = await deriveSessionKey(aliceKeys.privateKey, alicePeerKey, '1-amber-horizon');

    const bobPeerKey = await importPeerPublicKey(aliceKeys.rawPublicKey);
    const bobSession = await deriveSessionKey(bobKeys.privateKey, bobPeerKey, '2-cosmic-falcon');

    expect(aliceSession.authTag).not.toBe(bobSession.authTag);
  });

  it('encrypts and decrypts chunks with AES-256-GCM', async () => {
    const code = '5-ocean-breeze';
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const alicePeer = await importPeerPublicKey(bob.rawPublicKey);
    const { sessionKey: aliceKey } = await deriveSessionKey(alice.privateKey, alicePeer, code);

    const bobPeer = await importPeerPublicKey(alice.rawPublicKey);
    const { sessionKey: bobKey } = await deriveSessionKey(bob.privateKey, bobPeer, code);

    const plaintext = new TextEncoder().encode('Hello Zero-Knowledge P2P World! 🚀');
    const chunkIndex = 42;

    // Alice encrypts
    const envelope = await encryptChunk(aliceKey, chunkIndex, plaintext);
    expect(envelope.byteLength).toBe(4 + 12 + plaintext.byteLength + 16);

    // Bob decrypts
    const decrypted = await decryptChunk(bobKey, envelope);
    expect(decrypted.chunkIndex).toBe(chunkIndex);
    expect(new TextDecoder().decode(decrypted.plaintext)).toBe('Hello Zero-Knowledge P2P World! 🚀');
  });

  it('detects tampering in encrypted chunk envelope', async () => {
    const code = '9-ruby-flame';
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const alicePeer = await importPeerPublicKey(bob.rawPublicKey);
    const { sessionKey: aliceKey } = await deriveSessionKey(alice.privateKey, alicePeer, code);

    const bobPeer = await importPeerPublicKey(alice.rawPublicKey);
    const { sessionKey: bobKey } = await deriveSessionKey(bob.privateKey, bobPeer, code);

    const plaintext = new TextEncoder().encode('Sensitive Payload');
    const envelope = await encryptChunk(aliceKey, 1, plaintext);

    // Tamper with one byte of the ciphertext
    envelope[20] ^= 0xff;

    // Decryption must throw integrity / auth error
    await expect(decryptChunk(bobKey, envelope)).rejects.toThrow();
  });

  it('computes correct SHA-256 hashes', async () => {
    const data = new TextEncoder().encode('Droply P2P Test');
    const hash = await sha256(data);
    expect(hash.length).toBe(64);
    // Verified SHA-256 of "Droply P2P Test"
    expect(hash).toBe('c84fb5aa4b2d40d867f768896bfe3ec8354086385030ab3934c531610e3cb024');
  });

  it('slices buffers into chunks and tracks transfer speed', () => {
    const buffer = new Uint8Array(150 * 1024); // 150 KB
    const chunks = Array.from(sliceIntoChunks(buffer, 64 * 1024));
    expect(chunks.length).toBe(3);
    expect(chunks[0].byteLength).toBe(64 * 1024);
    expect(chunks[1].byteLength).toBe(64 * 1024);
    expect(chunks[2].byteLength).toBe(22 * 1024);

    const tracker = new SpeedTracker(150 * 1024);
    const report = tracker.update(75 * 1024);
    expect(report.percentage).toBe(50);
  });
});
