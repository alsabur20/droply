# Droply Security & Cryptographic Model

`droply` is engineered from the ground up to provide **Zero-Knowledge End-to-End Encryption (E2EE)**. No server, relay, intermediate proxy, or network eavesdropper can decrypt or tamper with any file, directory, or text transferred between peers.

---

## 1. Cryptographic Primitives

`droply` exclusively uses industry-standard, well-vetted cryptographic primitives provided natively by the W3C Web Crypto API in browsers and Node.js:

| Function | Primitive | Standard / Specification |
| :--- | :--- | :--- |
| **Key Agreement** | ECDH (Elliptic Curve Diffie-Hellman) | NIST P-256 curve (`secp256r1`) |
| **Key Derivation** | HKDF (HMAC-based Extract-and-Expand) | RFC 5869 with SHA-256 |
| **Payload Encryption** | AES-GCM (Galois/Counter Mode) | NIST SP 800-38D with 256-bit keys |
| **File Integrity** | SHA-256 | FIPS PUB 180-4 |
| **Randomness** | Cryptographically Secure RNG | `crypto.getRandomValues()` |

---

## 2. Zero-Knowledge Key Exchange

1. **Ephemeral Keys**:
   - For every transfer session, both sender and receiver generate a fresh, ephemeral P-256 ECDH key pair.
   - Private keys are kept strictly in memory and are never persisted to disk or sent across the network.

2. **Authenticated Derivation with Pairing Code**:
   - The shared ECDH secret $S = \text{ECDH}(\text{Priv}_A, \text{Pub}_B)$ is derived by both peers.
   - The shared secret is passed into HKDF using the normalized pairing code $C$ (e.g. `4-cosmic-falcon`) as the salt:
     $$\text{PRK} = \text{HKDF-Extract}(\text{Salt} = C, \text{IKM} = S)$$
     $$\text{SessionKey} = \text{HKDF-Expand}(\text{PRK}, \text{Info} = \text{"droply-v1-session-encryption"}, \text{Length} = 256)$$
     $$\text{AuthTag} = \text{HKDF-Expand}(\text{PRK}, \text{Info} = \text{"droply-v1-auth-tag"}, \text{Length} = 128)$$

3. **Mutual Code Verification**:
   - Both peers exchange `handshake-confirm` containing their derived $\text{AuthTag}$.
   - If an attacker attempts to join the room without knowing the exact pairing code, their derived $\text{AuthTag}$ will not match, and the session is immediately terminated before any manifest or file data is sent.

---

## 3. Chunk Encryption & Tamper Resistance

- Every 64 KB slice of a file is independently encrypted using **AES-256-GCM**.
- A unique 12-byte initialization vector (IV) is randomly generated for each chunk.
- The 4-byte chunk index is supplied as **Additional Authenticated Data (AAD)** to the cipher, mathematically guaranteeing that chunks cannot be replayed, omitted, or reordered without triggering a cryptographic authentication failure.

---

## 4. Threat Model & Mitigations

| Threat | Droply Mitigation |
| :--- | :--- |
| **Compromised Signaling Server** | Server never receives private keys or pairing codes. Server only sees public keys and encrypted ciphertext. Cannot decrypt transfers. |
| **Man-in-the-Middle (MitM)** | HKDF authentication salt binds the pairing code to the ECDH exchange. An attacker between peers cannot generate matching authentication tags. |
| **Data Tampering / Corruption** | AES-256-GCM provides authenticated encryption. Any bit flip in transit causes immediate chunk decryption failure. SHA-256 verified at end of file. |
| **Replay / Chunk Substitution** | Unique per-chunk random IVs and authenticated chunk indices prevent chunk replay or splicing across files. |
| **Unsolicited Malicious Files** | Safe interactive consent: receivers are shown a file manifest preview (names, types, sizes) and must explicitly confirm before receiving. |
| **Directory Traversal** | Path sanitization on receiver ensures all files are contained strictly within the destination directory. |
