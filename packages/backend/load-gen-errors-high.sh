#!/bin/sh
# Load scenario: HIGH ERRORS
# ~50% bad requests, 2x workers, faster pace, non-existent routes.
# Combine with ERROR_SCENARIO=high backend for maximum NR error signal.

BASE=http://localhost:8080/api/tutorials

npx load-generator \
  --workers 8 \
  --pause 1000 \
  --timeout 800 \
  "$BASE" \
  "$BASE/bad-uuid-1" \
  "$BASE/bad-uuid-2" \
  "$BASE/published" \
  "http://localhost:8080/api/nonexistent-endpoint" \
  "$BASE/categories" \
  "$BASE/bad-uuid-3" \
  "$BASE/difficulty/advanced" \
  -p
