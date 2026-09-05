/**
 * Droply Cryptographic Engine
 * Zero-Knowledge E2EE using Web Crypto API (supported natively in Node.js >= 18 and all modern browsers)
 */

export const WORDLIST = [
  'amber', 'anchor', 'apollo', 'arctic', 'atlas', 'autumn', 'breeze', 'beacon',
  'blaze', 'blossom', 'canyon', 'cedar', 'celestial', 'clover', 'cobalt', 'comet',
  'coral', 'cosmic', 'crystal', 'delta', 'dune', 'eagle', 'echo', 'eclipse',
  'ember', 'emerald', 'falcon', 'feather', 'flame', 'forest', 'frost', 'galaxy',
  'glacier', 'granite', 'harbor', 'haven', 'horizon', 'indigo', 'island', 'jasper',
  'jungle', 'jupiter', 'lagoon', 'lantern', 'lark', 'legend', 'lotus', 'lunar',
  'marble', 'meadow', 'mercury', 'mirage', 'monarch', 'moon', 'moss', 'nebula',
  'nest', 'nova', 'oasis', 'ocean', 'olive', 'onyx', 'opal', 'orbit',
  'oriole', 'orion', 'peak', 'pebble', 'phoenix', 'pinnacle', 'planet', 'polar',
  'prism', 'pulsar', 'pyramid', 'quartz', 'quiver', 'radiant', 'rainbow', 'raven',
  'reef', 'ripple', 'river', 'robin', 'rocket', 'ruby', 'sage', 'sail',
  'sapphire', 'saturn', 'serene', 'shadow', 'shield', 'sierra', 'silver', 'solar',
  'solstice', 'spark', 'summit', 'sunburst', 'taiga', 'timber', 'topaz', 'trail',
  'tundra', 'valley', 'velvet', 'vertex', 'vessel', 'vista', 'vortex', 'voyage',
  'whisper', 'willow', 'wind', 'zenith', 'zephyr'
];

export function generatePairingCode(): string {
  const number = Math.floor(Math.random() * 9) + 1;
  const idx1 = Math.floor(Math.random() * WORDLIST.length);
  let idx2 = Math.floor(Math.random() * WORDLIST.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * WORDLIST.length);
  }
  return `${number}-${WORDLIST[idx1]}-${WORDLIST[idx2]}`;
}

export function generatePinCode(): string {
  const part1 = Math.floor(100 + Math.random() * 900);
  const part2 = Math.floor(100 + Math.random() * 900);
  return `${part1}-${part2}`;
}

export function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

export function isValidCode(code: string): boolean {
  const normalized = normalizeCode(code);
  return /^[a-z0-9]+(-[a-z0-9]+)+$/.test(normalized);
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  rawPublicKey: Uint8Array;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );

  const rawPublicKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', keyPair.publicKey)
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    rawPublicKey
  };
}

export async function importPeerPublicKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

export async function deriveSessionKey(
  localPrivateKey: CryptoKey,
  peerPublicKey: CryptoKey,
  pairingCode: string
): Promise<{ sessionKey: CryptoKey; authTag: string }> {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    localPrivateKey,
    256
  );

  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedBits,
    { name: 'HKDF' },
    false,
    ['deriveKey', 'deriveBits']
  );

  const encoder = new TextEncoder();
  const salt = encoder.encode(normalizeCode(pairingCode));
  const infoKey = encoder.encode('droply-v1-session-encryption');
  const infoAuth = encoder.encode('droply-v1-auth-tag');

  const sessionKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt as unknown as BufferSource,
      info: infoKey as unknown as BufferSource
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  const authBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt as unknown as BufferSource,
      info: infoAuth as unknown as BufferSource
    },
    hkdfKey,
    128
  );

  const authTag = bytesToHex(new Uint8Array(authBits));

  return { sessionKey, authTag };
}

export async function encryptChunk(
  key: CryptoKey,
  chunkIndex: number,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aad = new Uint8Array(4);
  new DataView(aad.buffer).setUint32(0, chunkIndex, false);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      additionalData: aad as unknown as BufferSource
    },
    key,
    plaintext as unknown as BufferSource
  );

  const totalLength = 4 + 12 + ciphertext.byteLength;
  const result = new Uint8Array(totalLength);

  result.set(aad, 0);
  result.set(iv, 4);
  result.set(new Uint8Array(ciphertext), 16);

  return result;
}

export async function decryptChunk(
  key: CryptoKey,
  envelope: Uint8Array
): Promise<{ chunkIndex: number; plaintext: Uint8Array }> {
  if (envelope.byteLength < 4 + 12 + 16) {
    throw new Error('Encrypted chunk envelope too small');
  }

  const chunkIndex = new DataView(envelope.buffer, envelope.byteOffset, 4).getUint32(0, false);
  const aad = envelope.subarray(0, 4);
  const iv = envelope.subarray(4, 16);
  const ciphertext = envelope.subarray(16);

  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      additionalData: aad as unknown as BufferSource
    },
    key,
    ciphertext as unknown as BufferSource
  );

  return {
    chunkIndex,
    plaintext: new Uint8Array(plaintext)
  };
}

export async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
