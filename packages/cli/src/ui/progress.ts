import cliProgress from 'cli-progress';
import pc from 'picocolors';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function createProgressBar(title: string, totalBytes: number) {
  const bar = new cliProgress.SingleBar({
    format: `${pc.cyan(title)} |${pc.green('{bar}')}| {percentage}% | {speed} | ETA: {etaFormatted} | {valueFormatted}/{totalFormatted}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
    stopOnComplete: true
  });

  bar.start(totalBytes, 0, {
    speed: '0 B/s',
    etaFormatted: '--',
    valueFormatted: '0 B',
    totalFormatted: formatBytes(totalBytes)
  });

  return {
    update(currentBytes: number, speedBytesPerSec: number, etaSeconds: number) {
      bar.update(currentBytes, {
        speed: `${formatBytes(speedBytesPerSec)}/s`,
        etaFormatted: formatTime(etaSeconds),
        valueFormatted: formatBytes(currentBytes)
      });
    },
    stop() {
      bar.stop();
    }
  };
}
