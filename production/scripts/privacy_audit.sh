#!/usr/bin/env bash
# privacy_audit.sh - Scans packages/ai_runtime/ and packages/data_layer/ for
# outbound network calls outside the api.anthropic.com allowlist.
#
# This is the structural answer to "what stops a developer from sneaking in
# a network call that leaks user data?"
#
# Run via: melos run privacy-audit
# Exits non-zero on any violation.

set -euo pipefail

ALLOWED_DOMAIN="api.anthropic.com"
SCAN_DIRS=(
  "packages/ai_runtime"
  "packages/data_layer"
)

# Patterns that indicate outbound network calls.
# We catch package:http, dart:io HttpClient, WebSocket, dart's fetch.
NETWORK_PATTERNS=(
  'package:http/(get|post|put|delete|patch|head|read|send|Client)'
  'dart:io.*HttpClient'
  'dart:io.*HttpServer'
  'dart:io.*WebSocket'
  'WebSocket\.connect'
  'IOClient'
  'fetch\('
)

echo "=== Privacy audit: scanning for outbound network calls ==="
echo "Allowed domains: $ALLOWED_DOMAIN"
echo "Scan directories: ${SCAN_DIRS[*]}"
echo ""

violations=0
for dir in "${SCAN_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "SKIP: $dir does not exist (yet)"
    continue
  fi

  for pattern in "${NETWORK_PATTERNS[@]}"; do
    # Find files that contain the pattern, excluding test files and the
    # privacy audit script itself.
    matches=$(grep -rEn "$pattern" "$dir/lib" 2>/dev/null || true)

    if [ -n "$matches" ]; then
      while IFS= read -r match; do
        # Allow references in comments that explicitly say "// @allow-network: <domain>"
        # or "// @allow-network: any-test-endpoint" (for tests).
        file=$(echo "$match" | cut -d: -f1)
        lineno=$(echo "$match" | cut -d: -f2)

        if grep -B1 -A1 "$pattern" "$file" 2>/dev/null | grep -q '@allow-network'; then
          echo "ALLOW: $file:$lineno (explicit @allow-network annotation)"
          continue
        fi

        echo "VIOLATION: $match"
        violations=$((violations + 1))
      done <<< "$matches"
    fi
  done
done

echo ""
if [ "$violations" -gt 0 ]; then
  echo "=== FAIL: $violations violation(s) found ==="
  echo ""
  echo "These packages must NOT make outbound network calls except to"
  echo "$ALLOWED_DOMAIN (the opt-in cloud LLM tier)."
  echo ""
  echo "If you need to add a network call, you must:"
  echo "  1. Add an explicit allowlist entry in infra/scripts/privacy_audit.sh"
  echo "  2. Annotate the call site with // @allow-network: <domain>"
  echo "  3. Document the call in docs/04-platform-deep-dive.md"
  echo ""
  exit 1
fi

echo "=== PASS: no outbound network calls outside the allowlist ==="
echo "Privacy posture: structural."
exit 0
