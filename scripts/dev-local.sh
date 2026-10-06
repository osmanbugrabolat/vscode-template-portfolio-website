#!/usr/bin/env bash
# Runs the dev server against the local Supabase stack (docker) instead of production.
# Values from .env.test.local override .env.local because they are exported first.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source .env.test.local
set +a
exec npx next dev -p "${PORT:-3100}"
