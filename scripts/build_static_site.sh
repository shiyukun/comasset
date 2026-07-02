#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/web"
OUTPUT_DIR="${1:-${ROOT_DIR}/dist/aws-site}"

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

for file in \
  index.html \
  login.html \
  login.css \
  login.js \
  styles.css \
  app.js \
  config.js \
  data.js \
  data_adapter.js \
  data_status.js \
  backtest_engine.js \
  backtest_data.js \
  watchlist.js \
  watchlist.json \
  portfolio.js \
  snapshot.js \
  latest.json
do
  cp "${SOURCE_DIR}/${file}" "${OUTPUT_DIR}/${file}"
done

cp "${SOURCE_DIR}/index.html" "${OUTPUT_DIR}/404.html"

cat > "${OUTPUT_DIR}/deployment.json" <<JSON
{
  "app": "comasset-investment-lab",
  "builtAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "source": "web",
  "entry": "index.html"
}
JSON

echo "Built static site at ${OUTPUT_DIR}"
