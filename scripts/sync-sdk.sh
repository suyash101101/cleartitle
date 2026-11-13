#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cp "$ROOT/packages/sdk/src/"*.ts "$ROOT/apps/web/src/sdk/"
echo "Synced packages/sdk/src → apps/web/src/sdk"
