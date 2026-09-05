import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  generatePairingCode,
  generatePinCode,
  sha256,
  Manifest,
  FileEntry
} from '@droply/protocol';
import { DroplyClient } from '../client.js';
import { createProgressBar, formatBytes } from '../ui/progress.js';
import { renderTerminalQr } from '../ui/qr.js';

export interface SendOptions {
  server?: string;
  pin?: boolean;
  qr?: boolean;
  webUrl?: string;
}

export async function sendCommand(targets: string[], options: SendOptions = {}) {
  const serverUrl = options.server || process.env.DROPLY_SERVER || process.env.DIRECT_SERVER || 'wss://droply-n9z0.onrender.com';
  const webBaseUrl = options.webUrl || process.env.DROPLY_WEB_URL || process.env.DIRECT_WEB_URL || (serverUrl.includes('127.0.0.1') || serverUrl.includes('localhost') ? 'http://localhost:3000' : 'https://droply-n9z0.onrender.com');

  const filesToTransfer: Array<{ id: string; fullPath: string; relativePath: string }> = [];

  if (!targets || targets.length === 0) {
    console.error(pc.red('Error: Please specify at least one file or directory to send.'));
    console.error(pc.gray('Example: droply send document.pdf ./my-folder'));
    process.exit(1);
  }

  for (const target of targets) {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      console.error(pc.red(`Error: Path not found: ${target}`));
      process.exit(1);
    }

    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      filesToTransfer.push({
        id: `file-${filesToTransfer.length}`,
        fullPath: resolved,
        relativePath: path.basename(resolved)
      });
    } else if (stat.isDirectory()) {
      const rootDir = path.dirname(resolved);
      const walk = (currentDir: string) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const entryPath = path.join(currentDir, entry.name);
          if (entry.isFile()) {
            filesToTransfer.push({
              id: `file-${filesToTransfer.length}`,
              fullPath: entryPath,
              relativePath: path.relative(rootDir, entryPath)
            });
          } else if (entry.isDirectory()) {
            walk(entryPath);
          }
        }
      };
      walk(resolved);
    }
  }

  if (filesToTransfer.length === 0) {
    console.error(pc.red('Error: No files found to transfer.'));
    process.exit(1);
  }

  // Build manifest
  console.log(pc.cyan('Hashing payload and preparing manifest...'));
  const fileEntries: FileEntry[] = [];
  let totalBytes = 0;

  for (const file of filesToTransfer) {
    const data = fs.readFileSync(file.fullPath);
    const hash = await sha256(data);
    totalBytes += data.byteLength;
    fileEntries.push({
      id: file.id,
      path: file.relativePath,
      size: data.byteLength,
      sha256: hash
    });
  }

  const code = options.pin ? generatePinCode() : generatePairingCode();
  const manifest: Manifest = {
    transferId: `transfer-${Date.now()}`,
    payloadType: filesToTransfer.length > 1 ? 'directory' : 'file',
    files: fileEntries,
    totalBytes
  };

  const webUrl = `${webBaseUrl.replace(/\/$/, '')}/#${code}`;

  console.log('\n' + pc.bold(pc.green('🚀 Droply Transfer Ready!')));
  console.log('──────────────────────────────────────────────────');
  console.log(`${pc.bold('Pairing Code:')}  ${pc.bold(pc.yellow(code))}`);
  console.log(`${pc.bold('CLI Command:')}   ${pc.cyan(`droply receive ${code}`)}`);
  console.log(`${pc.bold('Web Link:')}      ${pc.underline(pc.blue(webUrl))}`);
  console.log(`${pc.bold('Payload:')}       ${filesToTransfer.length} item(s) (${formatBytes(totalBytes)})`);
  console.log('──────────────────────────────────────────────────\n');

  if (options.qr !== false && process.stdout.isTTY) {
    console.log(pc.gray('Scan QR Code to open in browser:'));
    renderTerminalQr(webUrl);
    console.log('');
  }

  let progressBar: ReturnType<typeof createProgressBar> | null = null;
  const startTime = Date.now();

  const client = new DroplyClient(serverUrl, code, 'sender', {
    onStatus: (status) => {
      console.log(pc.gray(`• ${status}`));
    },
    onProgress: (bytes, total, speed, eta) => {
      if (!progressBar && process.stdout.isTTY) {
        progressBar = createProgressBar('Sending', total);
      }
      progressBar?.update(bytes, speed, eta);
    },
    onComplete: () => {
      progressBar?.stop();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('\n' + pc.bold(pc.green(`✔ Transfer complete! ${formatBytes(totalBytes)} transferred in ${elapsed}s.`)));
      client.close();
      process.exit(0);
    },
    onError: (err) => {
      progressBar?.stop();
      console.error(pc.red(`\n✖ Transfer error: ${err.message}`));
      client.close();
      process.exit(1);
    }
  });

  await client.connect();
  await client.performHandshake();

  await client.sendPayload(manifest, async (fileId) => {
    const item = filesToTransfer.find(f => f.id === fileId);
    if (!item) throw new Error(`File not found: ${fileId}`);
    return fs.readFileSync(item.fullPath);
  });
}
