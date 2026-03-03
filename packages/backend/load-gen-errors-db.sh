#!/bin/sh
# Load scenario: DB ERRORS
# Heavy read load across all DB-backed endpoints.
# Combine with ERROR_SCENARIO=db backend to show DB connection pool errors in NR.

BASE=http://localhost:8080/api/tutorials

npx load-generator \
  --workers 6 \
  --pause 1500 \
  --timeout 3000 \
  "$BASE" \
  "$BASE/published" \
  "$BASE/difficulty/beginner" \
  "$BASE/difficulty/intermediate" \
  "$BASE/difficulty/advanced" \
  "$BASE/categories" \
  "$BASE" \
  "$BASE/published" \
  -p
