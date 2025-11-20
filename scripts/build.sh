#!/bin/bash
set -e

echo "Building linear-for-ai..."

# Clean dist directory
rm -rf dist
mkdir -p dist

# Compile for macOS (current platform)
echo "Compiling for macOS..."
deno compile \
  --allow-net \
  --allow-env \
  --allow-read \
  --output=dist/linear-for-ai \
  src/cli.ts

echo ""
echo "Build complete!"
echo "Executable: ./dist/linear-for-ai"
echo ""
echo "Test with:"
echo "  ./dist/linear-for-ai --version"
echo "  ./dist/linear-for-ai --help"
