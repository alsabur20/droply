# Documentation: https://docs.brew.sh/Formula-Cookbook
#                https://rubydoc.brew.sh/Formula
class Droply < Formula
  desc "Zero-Knowledge, End-to-End Encrypted P2P File Transfer"
  homepage "https://github.com/alsabur20/droply"
  version "1.0.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/alsabur20/droply/releases/download/v1.0.0/droply-macos-arm64.tar.gz"
    else
      url "https://github.com/alsabur20/droply/releases/download/v1.0.0/droply-macos-x64.tar.gz"
    end
  end

  on_linux do
    url "https://github.com/alsabur20/droply/releases/download/v1.0.0/droply-linux-x64.tar.gz"
  end

  def install
    bin.install "droply"
  end

  test do
    system "#{bin}/droply", "--version"
  end
end
