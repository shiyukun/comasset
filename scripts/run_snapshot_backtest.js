const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { runBacktest } = require("../web/backtest_engine.js");

const root = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    options[token.slice(2)] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return options;
}

function readSnapshots(historyDir) {
  const byId = new Map();
  fs.readdirSync(historyDir)
    .filter((file) => file.endsWith(".json"))
    .forEach((file) => {
      const snapshot = JSON.parse(fs.readFileSync(path.join(historyDir, file), "utf8"));
      if (snapshot.snapshotId && Array.isArray(snapshot.recommendations)) byId.set(snapshot.snapshotId, snapshot);
    });
  return [...byId.values()].sort((a, b) => String(a.generatedAt).localeCompare(String(b.generatedAt)));
}

const args = parseArgs(process.argv.slice(2));
const historyDir = path.resolve(root, args.history || path.join("snapshots", "history"));
const pricesPath = path.resolve(root, args.prices || path.join("data", "live_prices.json"));
const runsDir = path.resolve(root, args.output || path.join("data", "simulation_runs"));
const prices = JSON.parse(fs.readFileSync(pricesPath, "utf8"));
const snapshots = readSnapshots(historyDir);
const strategy = args.strategy || "mixed";

const result = runBacktest(
  {
    asOf: prices.asOf,
    prices: prices.prices,
    currencies: prices.currencies,
    snapshots,
  },
  {
    strategy,
    initialCapital: args.initial || 10000,
    monthlyContribution: args.monthly || 500,
    rebalance: args.rebalance || "monthly",
    topN: args["top-n"] || 5,
    slippage: args.slippage || 0.0005,
  }
);

const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const runId = `${timestamp}-${strategy}`;
const run = {
  runId,
  owner: args.member || "pipeline",
  storage: "filesystem",
  dataProvenance: {
    historyDir: path.relative(root, historyDir),
    prices: path.relative(root, pricesPath),
    priceSource: prices.source,
    priceAsOf: prices.asOf,
  },
  ...result,
};

fs.mkdirSync(runsDir, { recursive: true });
const fileName = `${runId}.json`;
fs.writeFileSync(path.join(runsDir, fileName), `${JSON.stringify(run, null, 2)}\n`);
fs.writeFileSync(path.join(runsDir, "latest.json"), `${JSON.stringify(run, null, 2)}\n`);

const indexPath = path.join(runsDir, "index.json");
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : { runs: [] };
index.updatedAt = new Date().toISOString();
index.runs = [
  {
    runId,
    file: fileName,
    owner: run.owner,
    strategy,
    generatedAt: run.generatedAt,
    period: run.period,
    summary: run.summary,
    sourceSnapshotIds: run.sourceSnapshotIds,
  },
  ...(index.runs || []).filter((item) => item.runId !== runId),
].slice(0, 100);
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

execFileSync(process.execPath, [path.join(root, "scripts", "build_backtest_bundle.js")], {
  cwd: root,
  stdio: "inherit",
});
console.log(`Saved backtest ${runId} to ${path.relative(root, path.join(runsDir, fileName))}.`);
