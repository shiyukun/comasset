const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.window = {};
require(path.join(root, "web", "data.js"));

const source = global.window.comassetData;

function parsePrice(price) {
  return Number(String(price).replace(/[$,]/g, ""));
}

function parseExpectedRange(range) {
  const matches = String(range).match(/([+-]?\d+(?:\.\d+)?)%/g) || [];
  const values = matches.map((item) => Number(item.replace("%", "")) / 100);
  return {
    low: values[0] ?? null,
    high: values[1] ?? values[0] ?? null,
    period: "12m",
  };
}

function normalizeInputScope(scope) {
  return String(scope)
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean);
}

function toIsoLike(value) {
  const normalized = String(value).replace(" SGT", "+08:00");
  return normalized.replace(" ", "T");
}

const snapshot = {
  snapshotId: "2026-W25",
  asOf: "2026-06-17",
  generatedAt: "2026-06-17T07:58:00+08:00",
  modelVersion: "comasset-score-v0.1",
  claudeSkillVersion: "claude-finance-skill-2026.06",
  dataCutoff: "2026-06-14T23:59:59-04:00",
  marketContext: {
    baseCurrency: "USD",
    benchmark: "SPY",
    updateCadence: "weekly",
  },
  recommendations: source.recommendations.map((item) => ({
    ticker: item.ticker,
    name: item.ticker,
    type: item.type,
    horizon: item.horizon,
    action: item.action,
    score: item.score,
    confidence: item.confidence,
    price: parsePrice(item.price),
    currency: "USD",
    expectedRange: parseExpectedRange(item.expectedRange),
    positionHint: item.positionHint,
    factorScores: Object.fromEntries(
      Object.entries(item.factors).map(([key, value]) => [key, value === 0 ? null : value])
    ),
    reason: {
      zh: item.reasonZh,
      en: item.reasonEn,
    },
    risks: {
      zh: item.risksZh,
      en: item.risksEn,
    },
    exitRules: {
      zh: item.exitZh,
      en: item.exitEn,
    },
    claudeAudit: {
      skillVersion: item.claude.version,
      calledAt: toIsoLike(item.claude.calledAt),
      inputScope: normalizeInputScope(item.claude.inputScope),
      summary: {
        zh: item.claude.summaryZh,
        en: item.claude.summaryEn,
      },
      conflicts: [],
    },
  })),
  factorValues: source.factorValues,
  simulationAssumptions: source.simulationAssumptions,
};

const snapshotsDir = path.join(root, "snapshots");
fs.mkdirSync(snapshotsDir, { recursive: true });
fs.writeFileSync(path.join(snapshotsDir, `${snapshot.snapshotId}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
fs.writeFileSync(path.join(snapshotsDir, "latest.json"), `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote ${snapshot.snapshotId} with ${snapshot.recommendations.length} recommendations.`);
