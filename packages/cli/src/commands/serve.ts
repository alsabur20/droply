import path from 'node:path';
import pc from 'picocolors';
import { createDroplyServer } from '@droply/server';

export interface ServeOptions {
  port?: string | number;
  host?: string;
  staticDir?: string;
}

export async function serveCommand(options: ServeOptions = {}) {
  const port = typeof options.port === 'string' ? parseInt(options.port, 10) : (options.port || 3000);
  const host = options.host || '0.0.0.0';
  const staticDir = options.staticDir ? path.resolve(options.staticDir) : undefined;

  const instance = createDroplyServer({ port, host, staticDir });
  const actualPort = await instance.listen(port, host);

  console.log('\n' + pc.bold(pc.green('⚡ Droply Server Running!')));
  console.log('──────────────────────────────────────────────────');
  console.log(`${pc.bold('Signaling URL:')}  ws://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}`);
  console.log(`${pc.bold('Health Check:')}   http://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}/healthz`);
  if (staticDir) {
    console.log(`${pc.bold('Web UI:')}         http://${host === '0.0.0.0' ? 'localhost' : host}:${actualPort}`);
  }
  console.log('──────────────────────────────────────────────────\n');
  console.log(pc.gray('Press Ctrl+C to stop.\n'));

  const shutdown = async () => {
    console.log(pc.yellow('\nShutting down server...'));
    await instance.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
