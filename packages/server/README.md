# @droply/server

Signaling, zero-knowledge encrypted relay, and Web UI static host for Droply.

## Capabilities
- **WebSocket Signaling**: Coordinates peer rendezvous using pairing codes without storing state.
- **Zero-Knowledge Encrypted Relay**: Transparently relays encrypted chunks if direct P2P connection fails.
- **Static Asset Host**: Built-in HTTP server hosting the production React Web UI bundle.
- **Health Checks**: `GET /healthz` endpoint returning active room count and server status.

## Usage
```bash
# Start server
node dist/index.js
```
