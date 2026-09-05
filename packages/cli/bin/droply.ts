#!/usr/bin/env node

import { Command } from 'commander';
import { sendCommand } from '../src/commands/send.js';
import { receiveCommand } from '../src/commands/receive.js';
import { serveCommand } from '../src/commands/serve.js';

const program = new Command();

program
  .name('droply')
  .description('Droply - Zero-knowledge end-to-end encrypted P2P file sharing utility')
  .version('1.0.0');

program
  .command('send <targets...>')
  .description('Send files or directories directly to a peer')
  .option('-s, --server <url>', 'Signaling server WebSocket URL')
  .option('--pin', 'Use a 6-digit numeric PIN instead of a word phrase')
  .option('--no-qr', 'Disable terminal QR code display')
  .option('--web-url <url>', 'Custom web client base URL')
  .action((targets, options) => {
    sendCommand(targets, options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

program
  .command('receive [code]')
  .description('Receive files from a peer using a pairing code')
  .option('-s, --server <url>', 'Signaling server WebSocket URL')
  .option('-o, --output-dir <path>', 'Destination directory to save received files', '.')
  .option('-y, --yes', 'Auto-accept transfer without confirmation prompt')
  .action((code, options) => {
    receiveCommand(code, options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

program
  .command('serve')
  .description('Start a local or self-hosted signaling and web relay server')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host address to bind to', '0.0.0.0')
  .option('--static-dir <path>', 'Path to static Web UI directory')
  .action((options) => {
    serveCommand(options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

program.parse(process.argv);
