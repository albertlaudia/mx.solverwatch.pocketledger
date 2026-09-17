#!/usr/bin/env bash
# One-command setup for a fresh PocketLedger developer environment.
#
# This is the FIRST thing a new contributor or co-founder runs.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/pocketledger/pocketledger/main/scripts/setup.sh | bash
#
# Or locally:
#   ./scripts/setup.sh

set -euo pipefail

echo "=== PocketLedger dev environment setup ==="

# 1. Check OS
OS="$(uname -s)"
case "$OS" in
  Linux|Darwin) ;;
  *) echo "Unsupported OS: $OS. Use macOS or Linux."; exit 1 ;;
esac

# 2. Install system deps
echo "--- Step 1/7: Install system packages"
if [ "$OS" = "Darwin" ]; then
  command -v brew >/dev/null 2>&1 || {
    echo "Homebrew not installed. Install from https://brew.sh"
    exit 1
  }
  brew install git curl unzip xz
elif [ "$OS" = "Linux" ]; then
  command -v apt-get >/dev/null 2>&1 && sudo apt-get update && sudo apt-get install -y git curl unzip xz-utils
fi
echo "OK"

# 3. Install fvm
echo "--- Step 2/7: Install FVM"
if ! command -v fvm >/dev/null 2>&1; then
  if [ "$OS" = "Darwin" ]; then
    brew tap leoafarias/fvm && brew install fvm
  else
    dart pub global activate fvm 2>/dev/null || {
      echo "Installing fvm via direct download..."
      curl -fsSL https://fvm.app/install.sh | bash
    }
  fi
fi
echo "OK"

# 4. Install melos
echo "--- Step 3/7: Install Melos"
dart pub global activate melos 2>/dev/null || true
echo "OK"

# 5. Install Flutter SDK version
echo "--- Step 4/7: Install Flutter 3.32.0"
cd "$(dirname "$0")/.."
fvm install 3.32.0
fvm use 3.32.0
echo "OK"

# 6. Bootstrap the workspace
echo "--- Step 5/7: melos bootstrap"
melos bootstrap
echo "OK"

# 7. Verify
echo "--- Step 6/7: Verify with melos run analyze"
melos run analyze --no-select 2>&1 | tail -5
echo "OK"

# 8. Done
echo "--- Step 7/7: Done"
echo ""
echo "=== PocketLedger dev environment ready ==="
echo ""
echo "Try:"
echo "  melos run test"
echo "  melos run math-audit"
echo "  melos run redteam"
echo "  melos run privacy-audit"
echo "  cd apps/ios && fvm flutter run -d <iPhone 15 Pro>"
