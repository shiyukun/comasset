const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const historyDir = process.argv[2] || path.join(root, "snapshots", "history");
const pricesPath = process.argv[3] || path.join(root, "data", "live_prices.json");
const runsDir = process.argv[4] || path.join(root, "data", "simulation_runs");
const outputPath = process.argv[5] || path.join(root, "web", "backtest_data.js");

function readSnapshots() {
  if (!fs.existsSync(historyDir)) return [];
  const byId = new Map();
  fs.readdirSync(historyDir)
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      const snapshot = JSON.parse(fs.readFileSync(path.join(historyDir, file), "utf8"));
      if (snapshot.snapshotId && Array.isArray(snapshot.recommendations)) byId.set(snapshot.snapshotId, snapshot);
    });
  return [...byId.values()].sort((a, b) => String(a.generatedAt).localeCompare(String(b.generatedAt)));
}

function readSavedRuns() {
  const indexPath = path.join(runsDir, "index.json");
  if (!fs.existsSync(indexPath)) return [];
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  return (index.runs || [])
    .slice(0, 20)
    .map((entry) => {
      const filePath = path.join(runsDir, entry.file);
      return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null;
    })
    .filter(Boolean);
}

const prices = JSON.parse(fs.readFileSync(pricesPath, "utf8"));
const payload = {
  generatedAt: new Date().toISOString(),
  asOf: prices.asOf,
  priceSource: prices.source,
  frequency: prices.frequency,
  currencies: prices.currencies || {},
  prices: prices.prices || {},
  snapshots: readSnapshots(),
  savedRuns: readSavedRuns(),
};

if (!payload.snapshots.length) throw new Error("No historical snapshots found for the backtest bundle.");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `window.comassetBacktestData = ${JSON.stringify(payload, null, 2)};\n`);
console.log(
  `Built ${path.relative(root, outputPath)} with ${payload.snapshots.length} snapshots and ${payload.savedRuns.length} saved runs.`
);
