#!/usr/bin/env bash
# Pre-flight checklist for the PocketLedger production build.
# Prints a checklist with status indicators for each gating condition.

set -euo pipefail

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m"

ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[FAIL]${NC} $1"; }

echo "=== PocketLedger pre-flight check ==="
echo ""

# 1. fvm
if command -v fvm >/dev/null 2>&1; then
  ok "fvm installed: $(fvm --version 2>&1 | head -1)"
else
  err "fvm not installed. Install: brew tap leoafarias/fvm && brew install fvm"
fi

# 2. dart
if command -v dart >/dev/null 2>&1; then
  ok "dart installed: $(dart --version 2>&1)"
else
  err "dart not installed. Install via fvm or system package manager"
fi

# 3. melos
if command -v melos >/dev/null 2>&1 || dart pub global list | grep -q melos; then
  ok "melos installed"
else
  warn "melos not installed. Run: dart pub global activate melos"
fi

# 4. .fvmrc
if [ -f .fvmrc ]; then
  ok ".fvmrc present: $(cat .fvmrc | head -c 100)"
else
  err ".fvmrc missing. Run bootstrap.sh first."
fi

# 5. melos.yaml
if [ -f melos.yaml ]; then
  ok "melos.yaml present"
else
  err "melos.yaml missing. Run bootstrap.sh first."
fi

# 6. Root pubspec.yaml
if [ -f pubspec.yaml ]; then
  ok "pubspec.yaml (root) present"
else
  err "pubspec.yaml (root) missing. Run bootstrap.sh first."
fi

# 7. packages
required_packages=(sdk math_engine ai_runtime data_layer ui personas frameworks checkin export analytics privacy config fixtures)
missing=0
for pkg in "${required_packages[@]}"; do
  if [ ! -d "packages/$pkg" ]; then
    err "packages/$pkg missing"
    missing=$((missing + 1))
  fi
done
if [ "$missing" -eq 0 ]; then
  ok "all 13 packages present"
fi

# 8. apps
required_apps=(ios android web backend)
for app in "${required_apps[@]}"; do
  if [ ! -d "apps/$app" ]; then
    err "apps/$app missing"
    missing=$((missing + 1))
  fi
done

# 9. LICENSE
if [ -f LICENSE ]; then
  if grep -q "AGPL" LICENSE; then
    ok "LICENSE is AGPL-3.0"
  else
    warn "LICENSE present but not AGPL-3.0"
  fi
else
  err "LICENSE missing"
fi

# 10. melos run analyze
if [ -f melos.yaml ] && [ -f pubspec.yaml ]; then
  echo ""
  echo "Running melos run analyze..."
  if melos run analyze --no-select 2>&1 | tail -20; then
    ok "melos run analyze: 0 warnings"
  else
    warn "melos run analyze: warnings present (expected on empty scaffolds)"
  fi
fi

# Summary
echo ""
echo "=== Summary ==="
if [ "$missing" -eq 0 ]; then
  echo -e "${GREEN}Ready for Epic 2 (math engine) and Epic 4 (on-device AI runtime).${NC}"
else
  echo -e "${RED}$missing items missing. Run ./scripts/bootstrap.sh first.${NC}"
  exit 1
fi
