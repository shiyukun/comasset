#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="${NODE_BIN:-/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node}"

exec "${NODE_BIN}" "${ROOT_DIR}/server/comasset_server.js"
