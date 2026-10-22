#!/usr/bin/env bash
# Runs one test file and surfaces FAIL lines as GitHub annotations (so failures are readable without the raw log).
export CHROMIUM=${CHROMIUM:-$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}")}
node "$1" 2>&1 | tee /tmp/test-out.txt; ec=${PIPESTATUS[0]}
if [ "$ec" != "0" ]; then grep -E "FAIL|Error|error" /tmp/test-out.txt | head -8 | while read -r l; do echo "::error title=$1::${l:0:300}"; done; fi
exit $ec
