#!/usr/bin/env bash
# Runs one test file and surfaces FAIL lines as GitHub annotations and in the run summary (so failures are readable without the raw log).
export CHROMIUM=${CHROMIUM:-$(node -e "try{console.log(require('playwright').chromium.executablePath())}catch(e){}")}
node "$1" 2>&1 | tee /tmp/test-out.txt; ec=${PIPESTATUS[0]}
if [ "$ec" != "0" ]; then
  # only real failures: a PASS line can mention "errors" too. A crash may print no FAIL line, so fall back to the last output.
  grep -E "^FAIL|^[0-9]+ FAILED|^FAILURES|Error:" /tmp/test-out.txt | grep -v "^PASS" > /tmp/test-fails.txt
  [ -s /tmp/test-fails.txt ] || tail -12 /tmp/test-out.txt > /tmp/test-fails.txt
  head -8 /tmp/test-fails.txt | while read -r l; do echo "::error title=$1::${l:0:300}"; done
  if [ -n "$GITHUB_STEP_SUMMARY" ]; then { echo "### $1 failed (exit $ec)"; echo '```'; cut -c1-300 /tmp/test-fails.txt; echo '```'; } >> "$GITHUB_STEP_SUMMARY"; fi
fi
exit $ec
