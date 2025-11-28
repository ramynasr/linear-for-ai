#!/bin/bash
set -e

# Update Homebrew formula with new version and checksums
# Usage: ./update-homebrew-formula.sh <version> <tap_repo_path>

VERSION=$1
TAP_REPO=$2

if [ -z "$VERSION" ] || [ -z "$TAP_REPO" ]; then
  echo "Usage: $0 <version> <tap_repo_path>"
  echo "Example: $0 0.1.0 /path/to/homebrew-tap"
  exit 1
fi

REPO_URL="https://github.com/ramynasr/linear-for-ai"
FORMULA_FILE="$TAP_REPO/Formula/linear-for-ai.rb"

echo "Updating Homebrew formula for version $VERSION..."

# Download binaries and calculate checksums
declare -A CHECKSUMS

for platform in "macos-x64" "macos-arm64" "linux-x64" "linux-arm64"; do
  binary_url="$REPO_URL/releases/download/v${VERSION}/linear-for-ai-${platform}"
  echo "Downloading $binary_url..."

  temp_file=$(mktemp)
  curl -sL "$binary_url" -o "$temp_file"

  checksum=$(shasum -a 256 "$temp_file" | awk '{print $1}')
  CHECKSUMS[$platform]=$checksum

  rm "$temp_file"
  echo "  Checksum: $checksum"
done

# Update formula file
cat > "$FORMULA_FILE" << EOF
class LinearForAi < Formula
  desc "CLI tool for AI agents to interact with Linear's GraphQL API"
  homepage "$REPO_URL"
  version "$VERSION"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "$REPO_URL/releases/download/v${VERSION}/linear-for-ai-macos-arm64"
      sha256 "${CHECKSUMS[macos-arm64]}"
    else
      url "$REPO_URL/releases/download/v${VERSION}/linear-for-ai-macos-x64"
      sha256 "${CHECKSUMS[macos-x64]}"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "$REPO_URL/releases/download/v${VERSION}/linear-for-ai-linux-arm64"
      sha256 "${CHECKSUMS[linux-arm64]}"
    else
      url "$REPO_URL/releases/download/v${VERSION}/linear-for-ai-linux-x64"
      sha256 "${CHECKSUMS[linux-x64]}"
    end
  end

  def install
    bin.install Dir["linear-for-ai*"].first => "linear-for-ai"
  end

  test do
    system "#{bin}/linear-for-ai", "--version"
  end
end
EOF

echo "Formula updated successfully!"
echo "Changes:"
git -C "$TAP_REPO" diff "$FORMULA_FILE"
