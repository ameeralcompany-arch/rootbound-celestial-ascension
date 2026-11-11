#!/bin/bash
# A private build of the game for previewing the evolution cinematics (never touches the real index.html): %TEMP%/rbevo/index.html
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; OUT="$TEMP/rbevo"; mkdir -p "$OUT"; rm -rf "$OUT/src" "$OUT/tools"
cp -r "$ROOT/src" "$ROOT/tools" "$OUT/"; mkdir -p "$OUT/server"; cp "$ROOT/server/catalog.json" "$OUT/server/"
[ -d "$OUT/assets" ] || cp -r "$ROOT/assets" "$OUT/" 2>/dev/null
for i in 1 2 3; do node "$OUT/tools/build.js" > "$OUT/build.log" 2>&1 && break; sleep 1; done; tail -1 "$OUT/build.log"
