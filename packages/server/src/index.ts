import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createDroplyServer } from './server.js';

export * from './server.js';
export * from './rooms.js';
export * from './relay.js';

import fs from 'node:fs';

// If run directly via `node dist/index.js`
const isMain = process.argv[1] && Boolean(import.meta?.url) && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';
  
  const candidateDirs = [
    process.env.STATIC_DIR,
    path.resolve(process.cwd(), 'packages/web/dist'),
    path.resolve(__dirname, '../../web/dist'),
    path.resolve(process.cwd(), '../web/dist')
  ];
  const staticDir = candidateDirs.find(d => d && fs.existsSync(d));

  const instance = createDroplyServer({ port, host, staticDir });
  instance.listen(port, host).then((actualPort) => {
    console.log(`[droply-server] Signaling & Relay server active on http://${host}:${actualPort}`);
    if (staticDir) {
      console.log(`[droply-server] Serving static Web UI from ${staticDir}`);
    }
  });

  const shutdown = async () => {
    console.log('\n[droply-server] Shutting down gracefully...');
    await instance.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
