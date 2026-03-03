#!/bin/sh
# Load scenario: LOW ERRORS
# Mixes valid requests with invalid UUIDs (~25% bad) to generate 400s.
# Combine with ERROR_SCENARIO=low backend for layered error visibility in NR.

BASE=http://localhost:8080/api/tutorials

npx load-generator \
  --workers 4 \
  --pause 2000 \
  --timeout 1500 \
  "$BASE" \
  "$BASE/published" \
  "$BASE/categories" \
  "$BASE/invalid-uuid-for-errors" \
  "$BASE/difficulty/beginner" \
  "$BASE/difficulty/intermediate" \
  -p
