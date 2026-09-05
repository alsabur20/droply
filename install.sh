#!/usr/bin/env bash
set -e

REPO="alsabur20/droply"
VERSION="v1.0.0"

echo "==> Detecting system architecture..."
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64)
    ARCH="x64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  *)
    echo "Error: Unsupported architecture $ARCH."
    exit 1
    ;;
esac

case "$OS" in
  linux)
    BINARY_NAME="droply-linux-x64"
    ;;
  darwin)
    if [ "$ARCH" = "arm64" ]; then
      BINARY_NAME="droply-macos-arm64"
    else
      BINARY_NAME="droply-macos-x64"
    fi
    ;;
  *)
    echo "Error: Unsupported operating system $OS. Please download the Windows binary from GitHub Releases."
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_NAME}"
INSTALL_DIR="/usr/local/bin"

echo "==> Downloading Droply (${VERSION}) for ${OS}-${ARCH}..."
TMP_FILE="$(mktemp)"
curl -fL --progress-bar "$DOWNLOAD_URL" -o "$TMP_FILE"

chmod +x "$TMP_FILE"

echo "==> Installing to ${INSTALL_DIR}/droply..."
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_FILE" "${INSTALL_DIR}/droply"
else
  echo "==> Admin privileges required to write to ${INSTALL_DIR}."
  sudo mv "$TMP_FILE" "${INSTALL_DIR}/droply"
fi

echo "==> Droply installed successfully!"
echo "==> Run 'droply --help' to get started."
