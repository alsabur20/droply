# @droply/cli

Terminal client and standalone runner for Droply P2P file transfers.

## Commands
- `droply send [targets...]`: Stream files, directories, or piped stdin to a peer.
- `droply receive [code]`: Connect to sender, display manifest preview, and receive files.
- `droply serve`: Spin up an embedded local or remote signaling and Web UI server.

## Features
- **Zero-Dependency Native Binaries**: Pre-compiled single-file executables for Linux, macOS (Apple Silicon), and Windows.
- **Terminal UI**: Progress bar with live transfer speed gauge and ETA.
- **Mobile Pairing**: Terminal ASCII QR code for camera scanning.
- **UNIX Pipes**: Supports piping stdin/stdout (`cat dump.sql | droply send`, `droply receive <code> > dump.sql`).
- **Automation Ready**: Non-interactive mode via `--yes` and output directory selection via `--output-dir`.

## Standalone SEA Binary Build
```bash
# Build standalone Single Executable Application
pnpm run bundle
pnpm run build:bin
```
