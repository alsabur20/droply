import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import pc from 'picocolors';
import { sha256, Manifest } from '@droply/protocol';
import { DroplyClient } from '../client.js';
import { createProgressBar, formatBytes } from '../ui/progress.js';

export interface ReceiveOptions {
  server?: string;
  outputDir?: string;
  yes?: boolean;
}

export async function receiveCommand(inputCode?: string, options: ReceiveOptions = {}) {
  const serverUrl = options.server || process.env.DROPLY_SERVER || process.env.DIRECT_SERVER || 'wss://droply-n9z0.onrender.com';
  const outputDir = path.resolve(options.outputDir || process.cwd());

  let code = inputCode?.trim();
  if (!code) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    code = await new Promise<string>((resolve) => {
      rl.question(pc.bold('Enter pairing code: '), (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!code) {
    console.error(pc.red('Error: Pairing code is required.'));
    process.exit(1);
  }

  console.log(pc.cyan(`\nConnecting to peer using code: ${pc.bold(code)}...`));

  let progressBar: ReturnType<typeof createProgressBar> | null = null;
  let receivedManifest: Manifest | null = null;
  const startTime = Date.now();

  const client = new DroplyClient(serverUrl, code, 'receiver', {
    onStatus: (status) => {
      console.log(pc.gray(`• ${status}`));
    },
    onManifestReceived: async (manifest) => {
      receivedManifest = manifest;
      if (options.yes || !process.stdin.isTTY) {
        return true;
      }

      console.log('\n' + pc.bold('Incoming Transfer Request:'));
      console.log('──────────────────────────────────────────────────');
      console.log(`${pc.bold('Type:')}        ${manifest.payloadType}`);
      console.log(`${pc.bold('Total Size:')}  ${formatBytes(manifest.totalBytes)}`);
      console.log(`${pc.bold('Items:')}       ${manifest.files.length} file(s)`);
      for (const f of manifest.files.slice(0, 5)) {
        console.log(`  - ${f.path} (${formatBytes(f.size)})`);
      }
      if (manifest.files.length > 5) {
        console.log(pc.gray(`  ... and ${manifest.files.length - 5} more file(s)`));
      }
      console.log('──────────────────────────────────────────────────');

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await new Promise<string>((resolve) => {
        rl.question(pc.bold('Accept transfer? [Y/n] '), (ans) => {
          rl.close();
          resolve(ans.trim().toLowerCase());
        });
      });

      return answer === '' || answer === 'y' || answer === 'yes';
    },
    onProgress: (bytes, total, speed, eta) => {
      if (process.stdout.isTTY) {
        if (!progressBar) {
          progressBar = createProgressBar('Receiving', total);
        }
        progressBar.update(bytes, speed, eta);
      }
    },
    onComplete: () => {
      progressBar?.stop();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log('\n' + pc.bold(pc.green(`✔ Download complete! Saved to ${outputDir} in ${elapsed}s.`)));
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

  await client.receivePayload(async (fileId, relativePath, data) => {
    const targetPath = path.join(outputDir, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, data);

    // Verify hash
    const expectedHash = receivedManifest?.files.find(f => f.id === fileId)?.sha256;
    if (expectedHash) {
      const actualHash = await sha256(data);
      if (actualHash !== expectedHash) {
        throw new Error(`Checksum mismatch for ${relativePath}`);
      }
    }
  });
}
