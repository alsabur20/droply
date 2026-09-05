import qrcode from 'qrcode-terminal';

export function renderTerminalQr(url: string) {
  qrcode.generate(url, { small: true });
}
