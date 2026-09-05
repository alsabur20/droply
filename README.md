<div align="center">

# Droply ⚡
### Zero-Knowledge, End-to-End Encrypted Peer-to-Peer File Transfer

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg)](https://www.typescriptlang.org/)

**Droply** is a modern, blazing-fast file and directory transfer utility designed for seamless peer-to-peer sharing between **terminals** and **web browsers**.
</div>

---

## ✨ Features

- 🔒 **Zero-Knowledge E2EE**: Ephemeral ECDH (P-256) key exchange authenticated via pairing codes, AES-256-GCM chunk encryption, and SHA-256 integrity verification.
- 🌐 **Full Interoperability**: CLI-to-CLI, Web-to-Web, and cross-platform CLI-to-Web direct transfers.
- 🚀 **High-Throughput Streaming**: 64 KB streaming chunks with backpressure and low memory footprint, capable of streaming gigabyte-scale files without RAM spikes.
- 🗂️ **Folder & Batch Transfers**: Preserves full relative directory structures during directory transfers.
- 📱 **Instant Pairing**: Human-friendly pairing codes (e.g. `4-cosmic-falcon`) or 6-digit numeric PINs with clickable URLs and terminal/web QR codes for mobile scanning.
- 🛡️ **Safe Consent Mode**: Interactive preview of file manifest (names, types, sizes) before downloading to prevent unsolicited files.
- 🔄 **Resilient Connectivity**: Direct WebRTC P2P (via public STUN) with automatic, transparent end-to-end encrypted relay fallback through the signaling server.
- 🖥️ **Standalone Native Binaries & Zips**: Pre-compiled single-file executables and `.zip` / `.tar.gz` archives for Linux, macOS (Apple Silicon), and Windows with zero runtime dependencies.
- 📄 **GitHub Pages Ready**: Static React Web UI can be hosted directly on GitHub Pages with configurable signaling endpoints.
- 🐳 **Self-Host Ready**: Bundled single-process signaling and static Web UI server with 1-command Docker Compose deployment.

---

## 📦 Quick Start

### 1. Download Standalone Native Binaries & Zips (No Node.js Required)
Pre-compiled standalone executables and `.zip` archives are published on every release under the GitHub Releases section:

| Platform / Architecture | Direct Binary Executable | Compressed Zip Archive | Tarball Archive |
| :--- | :--- | :--- | :--- |
| **Linux (x64)** | `droply-linux-x64` | `droply-linux-x64.zip` | `droply-linux-x64.tar.gz` |
| **macOS Apple Silicon (M1/M2/M3/M4)** | `droply-darwin-arm64` | `droply-darwin-arm64.zip` | `droply-darwin-arm64.tar.gz` |
| **Windows (x64)** | `droply-windows-x64.exe` | `droply-windows-x64.zip` | — |

```bash
# Option A: Download raw executable directly via curl (Linux / macOS)
chmod +x droply && sudo mv droply /usr/local/bin/

# Option B: Download and extract .zip archive
unzip droply-linux-x64.zip
chmod +x droply && sudo mv droply /usr/local/bin/
```

### 2. Using the CLI with Node / npx

```bash
# Send a file or directory
droply send ./document.pdf ./my-folder

# Send with 6-digit PIN mode instead of words
droply send file.zip --pin

# Receive files using the pairing code
droply receive 4-cosmic-falcon

# Auto-accept transfer and save to a specific directory
droply receive 4-cosmic-falcon --yes --output-dir ./downloads
```

### 3. Self-Hosting with Docker Compose

Spin up your private signaling and Web UI server in seconds:

```bash
docker compose up -d
```

Open `http://localhost:3000` in your browser. The Web UI and signaling engine are served simultaneously on the same port!

---

## 💻 CLI Command Reference

### `droply send <targets...>`
Send files or directories to a peer.

| Option | Description | Default |
| :--- | :--- | :--- |
| `-s, --server <url>` | Custom signaling server WebSocket URL | `ws://127.0.0.1:3000` |
| `--pin` | Generate a 6-digit numeric PIN (e.g. `492-108`) | Word phrase |
| `--no-qr` | Disable terminal QR code rendering | `false` |
| `--web-url <url>` | Custom base URL for web links | Server HTTP URL |

### `droply receive [code]`
Receive incoming files from a peer.

| Option | Description | Default |
| :--- | :--- | :--- |
| `-s, --server <url>` | Custom signaling server WebSocket URL | `ws://127.0.0.1:3000` |
| `-o, --output-dir <dir>` | Destination folder for received files | `.` (Current dir) |
| `-y, --yes` | Auto-accept transfer without confirmation prompt | `false` |

### `droply serve`
Start an embedded local signaling and static Web UI server.

| Option | Description | Default |
| :--- | :--- | :--- |
| `-p, --port <port>` | Port to bind to | `3000` |
| `-h, --host <host>` | Host interface to bind to | `0.0.0.0` |
| `--static-dir <dir>` | Path to built Web UI assets | Embedded dist |

---

## 🏗️ Repository Architecture

The project is managed as a `pnpm` monorepo:

| Package | Description |
| :--- | :--- |
| [`@droply/protocol`](./packages/protocol) | Shared cryptographic primitives (Web Crypto ECDH, HKDF, AES-256-GCM), wire protocol schemas, and chunk streamer. |
| [`@droply/server`](./packages/server) | WebSocket signaling server, ephemeral room manager, zero-knowledge relay, and HTTP static file server. |
| [`@droply/cli`](./packages/cli) | Interactive terminal tool (`droply send`, `receive`, `serve`), terminal QR, and progress bar. |
| [`@droply/web`](./packages/web) | Modern React 18 + Vite + Tailwind CSS web application with dark/light themes, drag-and-drop, and QR pairing. |

- Detailed architectural specifications: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Cryptographic security model & threat analysis: [docs/SECURITY.md](docs/SECURITY.md)

---

## 🧪 Development & Testing

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run unit and integration tests
pnpm test

# Type-check workspace
pnpm check

# Build standalone SEA binary blob
pnpm run build:bin
```

---

## 📄 License

MIT © [Abdul Sabur](mailto:alsabur20@gmail.com)
