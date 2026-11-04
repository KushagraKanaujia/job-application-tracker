#!/bin/bash
# Re-renders icon16/48/128.png from dashboard/icon.svg using headless Google Chrome (macOS path).
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP=$(mktemp -d)
for size in 16 48 128; do
  printf '<html><body style="margin:0"><img src="file://%s/dashboard/icon.svg" width="%s" height="%s" style="display:block"></body></html>' "$PWD" "$size" "$size" > "$TMP/i$size.html"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size=$size,$size --screenshot="$PWD/icon$size.png" "$TMP/i$size.html" 2>/dev/null
  echo "Created icon$size.png"
done
rm -rf "$TMP"
