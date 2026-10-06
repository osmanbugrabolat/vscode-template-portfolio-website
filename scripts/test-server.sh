#!/usr/bin/env bash
# Production build + server against the LOCAL Supabase stack, for end-to-end tests.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source .env.test.local
set +a
npx next build
exec npx next start -p "${PORT:-3200}"
