#!/usr/bin/env bash
# Builds the installable Chrome extension zip (includes the full dashboard).
# Output: dist/job-application-tracker-extension-v<version>.zip
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./chrome-extension/manifest.json').version")
OUT="dist/job-application-tracker-extension-v${VERSION}.zip"
mkdir -p dist
rm -f "$OUT"
(cd chrome-extension && zip -qr "../$OUT" . -x 'create-icons.sh' -x '.*' -x '*/.*')
echo "Built $OUT"
