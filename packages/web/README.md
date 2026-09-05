# @droply/web

Modern React 18 + Vite + Tailwind CSS Web Application for Droply P2P transfers.

## Highlights
- **Full Interoperability**: Sends and receives files directly to/from the terminal CLI.
- **Drag & Drop**: Native drag-and-drop dropzone supporting both individual files and entire directory hierarchies.
- **Safe Consent Modal**: Visual preview of incoming transfers before accepting.
- **Theme Switcher**: Dark slate mode and light theme with local persistence.
- **Instant Pairing**: Auto-fills pairing codes directly from URL hashes (`#4-cosmic-falcon`).
- **Configurable Signaling Server**: Built-in Settings modal allows connecting the web client (e.g. hosted on GitHub Pages) to any self-hosted Droply server.

## Development & Build
```bash
# Run local Vite dev server with hot reload
pnpm dev

# Compile production bundle to dist/
pnpm build
```
