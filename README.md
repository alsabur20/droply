<div align="center">

# Droply ⚡
### Zero-Knowledge, End-to-End Encrypted Peer-to-Peer File Transfer

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](Dockerfile)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg)](https://render.com)

**Droply** is a modern, blazing-fast file and directory transfer tool built for effortless peer-to-peer sharing between **terminals**, **browsers**, and **mobile devices**.

[Live Web App](https://droply-n9z0.onrender.com) • [Releases & Binaries](https://github.com/alsabur20/droply/releases) • [Architecture Docs](docs/ARCHITECTURE.md)

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Installation & Setup](#-installation--setup)
  - [1. One-Line Shell Installer](#1-one-line-shell-installer-linux--macos)
  - [2. Using npm / npx](#2-using-npm--npx-universal-package-manager)
- [Usage Guide](#-usage-guide)
  - [Sending Files & Folders](#sending-files--folders)
  - [Receiving Files](#receiving-files)
  - [Sending Secret Notes](#sending-secret-notes)
- [Self-Hosting & Deployment](#-self-hosting--deployment)
  - [Deploy on Render (Full Unified App)](#deploy-on-render-full-unified-app)
  - [Self-Host with Docker Compose](#self-host-with-docker-compose)
- [CLI Command Reference](#-cli-command-reference)
- [Security & Architecture](#-security--architecture)
- [License](#-license)

---

## ✨ Features

- 🔒 **Zero-Knowledge E2EE**: Ephemeral ECDH (P-256) key exchange authenticated by memorable pairing codes. AES-256-GCM chunk encryption and SHA-256 integrity verification.
- 🌐 **Full Interoperability**: Send and receive across Terminal-to-Terminal, Browser-to-Browser, and Terminal-to-Browser.
- 🚀 **High-Throughput Streaming**: 64 KB binary streaming chunks with backpressure. Transfers gigabyte-scale files without RAM exhaustion.
- 🗂️ **Folder & Batch Transfers**: Preserves full relative directory trees during recursive directory transfers.
- 📱 **Instant Pairing**: Human-friendly passphrases (e.g. `4-cosmic-falcon`) or 6-digit numeric PINs with clickable web links and terminal/web QR codes for mobile cameras.
- 🛡️ **Safe Consent Mode**: Recipients preview incoming manifests (file names, sizes, counts) before downloading.
- 🔄 **Resilient Relay Fallback**: Direct WebRTC P2P when reachable, with automatic zero-knowledge encrypted fallback through the signaling server if symmetric NATs/firewalls block direct UDP.

---

## 📥 Installation & Setup

Choose your preferred way to install and run Droply:

### 1. One-Line Shell Installer (Linux & macOS)
Install the pre-compiled native binary directly to `/usr/local/bin` in one command:
```bash
curl -fsSL https://raw.githubusercontent.com/alsabur20/droply/main/install.sh | bash
```

---

### 2. Using npm / npx (Universal Package Manager)

#### Run instantly with `npx` (Zero install):
```bash
# Send a file
npx droply-cli send document.pdf

# Receive files
npx droply-cli receive 4-cosmic-falcon
```

#### Install globally via `npm`:
```bash
npm install -g droply-cli

# The 'droply' command is now available globally:
droply --help
```

---

## 🚀 Usage Guide

### Sending Files & Folders

#### From the CLI:
```bash
# Send a single file
droply send ./presentation.pdf

# Send multiple files and folders recursively
droply send ./image.png ./dataset/ ./notes.txt

# Send with a 6-digit numeric PIN instead of words (e.g. 482-195)
droply send ./archive.tar.gz --pin

# Connect to a custom or private relay server
droply send ./document.pdf --server wss://my-relay.example.com
```

#### From the Web Browser:
1. Open [https://droply-n9z0.onrender.com](https://droply-n9z0.onrender.com) (or your self-hosted instance).
2. Drag & drop files or folders into the Send dropzone.
3. Click **Send file**.
4. Share the generated code (or have the recipient scan the QR code).

---

### Receiving Files

#### From the CLI:
```bash
# Interactive receive (prompts for pairing code)
droply receive

# Receive directly with pairing code
droply receive 4-cosmic-falcon

# Auto-accept transfer and save to a specific folder
droply receive 4-cosmic-falcon --yes --output-dir ~/Downloads
```

#### From the Web Browser:
1. Open the Web UI and navigate to the **Receive** panel.
2. Enter the pairing code (e.g. `4-cosmic-falcon`).
3. Review the incoming manifest modal and click **Accept & Receive**. Files download automatically upon integrity verification.

---

### Sending Secret Notes

You can transfer sensitive text snippets (passwords, tokens, SSH keys) securely end-to-end:
- **Web**: Click **Text Snippet** on the main panel, paste your text, and click **Send Secret Note**.
- **CLI**: The recipient receives a verified text file `message.txt`.

---

## ☁️ Self-Hosting & Deployment

### Deploy on Render (Full Unified App)

Droply runs both the **React Web UI** and the **WebSocket Signaling / Zero-Knowledge Relay** simultaneously inside a single Docker container on port 3000.

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your repository: `alsabur20/droply`.
3. Select **Docker** as the Runtime and choose the **Free** instance type.
4. Click **Deploy Web Service**.

> **Automatic SSL & Zero Config:**
> Render provisions an automated HTTPS/WSS URL (`https://<service-name>.onrender.com`). Both the Web UI and WebSocket relay work instantly without setting any environment variables.

---

### Self-Host with Docker Compose

To deploy Droply on your own VPS or local server:

```bash
docker compose up -d
```

The service is available at `http://localhost:3000`.

To expose it to the internet with your own domain, point your reverse proxy (Nginx, Caddy, or Traefik) to port 3000 with WebSocket upgrading enabled.

---

## 💻 CLI Command Reference

### `droply send <targets...>`
| Option | Description | Default |
| :--- | :--- | :--- |
| `-s, --server <url>` | Custom signaling WebSocket URL | `wss://droply-n9z0.onrender.com` |
| `--pin` | Generate 6-digit numeric PIN instead of words | Word phrase |
| `--no-qr` | Disable terminal QR code display | `false` |
| `--web-url <url>` | Custom web client base URL | Live web URL |

### `droply receive [code]`
| Option | Description | Default |
| :--- | :--- | :--- |
| `-s, --server <url>` | Custom signaling WebSocket URL | `wss://droply-n9z0.onrender.com` |
| `-o, --output-dir <dir>` | Destination folder for received files | `.` (Current dir) |
| `-y, --yes` | Auto-accept transfer without confirmation prompt | `false` |

### `droply serve`
| Option | Description | Default |
| :--- | :--- | :--- |
| `-p, --port <port>` | Port to bind to | `3000` |
| `-h, --host <host>` | Host address to bind to | `0.0.0.0` |
| `--static-dir <dir>` | Path to built static Web UI directory | Embedded dist |

---

## 🛡️ Security & Architecture

```
[ Sender (Web / CLI) ]
          |
          | 1. Ephemeral ECDH (P-256) Key Exchange
          |    + Pairing Code Salt (SPAKE2 / PBKDF2)
          v
[ Zero-Knowledge Session Key (AES-256-GCM) ]
          |
   +------+--------------------------------+
   | (Direct UDP reachable)                | (Firewall / Symmetric NAT)
   v                                       v
[ WebRTC P2P DataChannel ]        [ Signaling & Relay Server ]
   (Direct DTLS/SCTP)             (Ciphertext passthrough only;
                                   Zero knowledge of keys or contents)
   +---------------------------------------+
          |
          v
[ Recipient (Web / CLI) ] (SHA-256 Verified)
```

1. **Zero-Knowledge Principle**: The signaling server only receives encrypted chunks. It cannot derive keys, view payloads, or inspect file metadata.
2. **Encrypted in Chunks**: Files stream in 64 KB authenticated chunks (`AES-256-GCM`) with independent IVs and chunk counters.
3. **Integrity Guaranteed**: Every file includes a SHA-256 digest computed before encryption and verified after decryption.
4. **Ephemerality**: Rooms and pairing codes expire immediately after transfer or after 15 minutes of inactivity. No files are ever saved to disk on any intermediate server.

For detailed security analyses, see [docs/SECURITY.md](docs/SECURITY.md).

---

## 📄 License

MIT © [Abdul Sabur](mailto:alsabur20@gmail.com)
