#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$REPO_ROOT"

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . ".env.local"
  set +a
fi

python3 scripts/drive/cron-sync.py
