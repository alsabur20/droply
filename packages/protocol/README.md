# @droply/protocol

Shared cryptographic engine, wire protocol definitions, and chunk streaming logic for Droply.

## Primitives
- **ECDH**: P-256 curve key exchange.
- **HKDF**: RFC 5869 extract-and-expand key derivation using pairing code salt.
- **AES-256-GCM**: Authenticated 64KB chunk encryption with random IVs and authenticated chunk indices.
- **SHA-256**: File integrity validation.

## Exports
- `generatePairingCode()`, `generatePinCode()`
- `generateKeyPair()`, `importPeerPublicKey()`, `deriveSessionKey()`
- `encryptChunk()`, `decryptChunk()`, `sha256()`
- `sliceIntoChunks()`, `SpeedTracker`
- Wire protocol message types (`Manifest`, `FileEntry`, `PeerControlMessage`, `SignalingMessage`)
