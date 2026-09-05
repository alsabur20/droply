import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { SignalingMessage } from '@droply/protocol';
import { RoomManager } from './rooms.js';
import { RelayManager } from './relay.js';

export interface ServerOptions {
  port?: number;
  host?: string;
  staticDir?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

export function createDroplyServer(options: ServerOptions = {}) {
  const roomManager = new RoomManager();
  const relayManager = new RelayManager();

  const staticDir = options.staticDir ? path.resolve(options.staticDir) : undefined;

  const server = http.createServer((req, res) => {
    if (req.url === '/healthz' || req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', activeRooms: roomManager.activeRoomCount }));
      return;
    }

    if (staticDir && fs.existsSync(staticDir) && req.method === 'GET') {
      let reqPath = req.url ? req.url.split('?')[0] : '/';
      if (reqPath === '/') reqPath = '/index.html';

      let filePath = path.join(staticDir, reqPath);
      if (!filePath.startsWith(staticDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      const indexPath = path.join(staticDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(indexPath).pipe(res);
        return;
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Droply Signaling Server');
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let isRelaying = false;

    ws.on('message', (data: RawData, isBinary: boolean) => {
      if (isBinary || isRelaying) {
        const { peer } = roomManager.getPeer(ws);
        if (peer && peer.ws.readyState === WebSocket.OPEN) {
          relayManager.forward(peer.ws, data, isBinary);
        }
        return;
      }

      try {
        const text = data.toString('utf-8');
        const msg = JSON.parse(text) as SignalingMessage;

        switch (msg.type) {
          case 'join': {
            const { room, peer, error } = roomManager.join(msg.code, msg.role, ws);
            if (error) {
              ws.send(JSON.stringify({ type: 'error', message: error }));
              return;
            }

            if (peer && peer.ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'peer-joined', role: peer.role }));
              peer.ws.send(JSON.stringify({ type: 'peer-joined', role: msg.role }));
            }
            break;
          }

          case 'relay-fallback': {
            isRelaying = true;
            const { peer } = roomManager.getPeer(ws);
            if (peer && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(JSON.stringify({ type: 'relay-fallback' }));
            }
            break;
          }

          case 'sdp-offer':
          case 'sdp-answer':
          case 'ice-candidate': {
            const { peer } = roomManager.getPeer(ws);
            if (peer && peer.ws.readyState === WebSocket.OPEN) {
              peer.ws.send(JSON.stringify(msg));
            }
            break;
          }

          default: {
            const { peer } = roomManager.getPeer(ws);
            if (peer && peer.ws.readyState === WebSocket.OPEN) {
              relayManager.forward(peer.ws, data, isBinary);
            }
            break;
          }
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid signaling frame: ' + err.message }));
      }
    });

    ws.on('close', () => {
      const { remainingPeer } = roomManager.leave(ws);
      if (remainingPeer && remainingPeer.ws.readyState === WebSocket.OPEN) {
        remainingPeer.ws.send(JSON.stringify({ type: 'peer-left' }));
      }
    });
  });

  return {
    server,
    wss,
    roomManager,
    relayManager,
    listen(port = options.port || 3000, host = options.host || '0.0.0.0'): Promise<number> {
      return new Promise((resolve) => {
        server.listen(port, host, () => {
          const addr = server.address();
          const actualPort = typeof addr === 'object' && addr ? addr.port : port;
          resolve(actualPort);
        });
      });
    },
    close(): Promise<void> {
      return new Promise((resolve) => {
        for (const client of wss.clients) {
          try {
            client.terminate();
          } catch {
            // ignore
          }
        }
        wss.close(() => {
          if ('closeAllConnections' in server && typeof server.closeAllConnections === 'function') {
            server.closeAllConnections();
          }
          server.close(() => resolve());
        });
      });
    }
  };
}

export { createDroplyServer as createDirectServer };

