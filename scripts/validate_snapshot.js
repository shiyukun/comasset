const fs = require("fs");
const path = require("path");

const snapshotPath = process.argv[2] || path.join(__dirname, "..", "snapshots", "latest.json");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const errors = [];
const horizons = new Set(["short", "long", "ultra"]);
const actions = new Set(["buy", "watch", "dca"]);
const confidence = new Set(["low", "medium", "high"]);
const types = new Set(["stock", "etf", "fund"]);
const factorKeys = ["fundamentals", "valuation", "momentum", "fundQuality", "macroSensitivity", "riskControl"];

function requireField(object, key, context) {
  if (object[key] === undefined || object[key] === null || object[key] === "") {
    errors.push(`${context}: missing ${key}`);
  }
}

function assertEnum(value, allowed, context) {
  if (!allowed.has(value)) {
    errors.push(`${context}: invalid value "${value}"`);
  }
}

function assertScore(value, context) {
  if (typeof value !== "number" || value < 0 || value > 100) {
    errors.push(`${context}: score must be 0-100`);
  }
}

["snapshotId", "asOf", "generatedAt", "modelVersion", "codexAuditSkillVersion", "dataCutoff"].forEach((key) => {
  requireField(snapshot, key, "snapshot");
});

if (!Array.isArray(snapshot.recommendations) || snapshot.recommendations.length === 0) {
  errors.push("snapshot: recommendations must be a non-empty array");
}

(snapshot.recommendations || []).forEach((item, index) => {
  const context = `recommendations[${index}] ${item.ticker || ""}`.trim();
  ["ticker", "type", "horizon", "action", "score", "confidence", "price", "currency"].forEach((key) => {
    requireField(item, key, context);
  });
  if (item.currency !== "USD" && !item.market) errors.push(`${context}: non-USD recommendation must include market`);
  assertEnum(item.type, types, `${context}.type`);
  assertEnum(item.horizon, horizons, `${context}.horizon`);
  assertEnum(item.action, actions, `${context}.action`);
  assertEnum(item.confidence, confidence, `${context}.confidence`);
  assertScore(item.score, `${context}.score`);

  if (!item.reason?.zh || !item.reason?.en) errors.push(`${context}: reason must be bilingual`);
  if (!Array.isArray(item.risks?.zh) || !Array.isArray(item.risks?.en)) errors.push(`${context}: risks must be bilingual arrays`);
  if (!Array.isArray(item.exitRules?.zh) || !Array.isArray(item.exitRules?.en)) errors.push(`${context}: exitRules must be bilingual arrays`);

  factorKeys.forEach((key) => {
    if (!(key in (item.factorScores || {}))) errors.push(`${context}: missing factorScores.${key}`);
    const value = item.factorScores?.[key];
    if (value !== null && (typeof value !== "number" || value < 0 || value > 100)) {
      errors.push(`${context}: factorScores.${key} must be null or 0-100`);
    }
  });

  ["skillVersion", "calledAt", "inputScope", "summary"].forEach((key) => {
    requireField(item.codexAudit || {}, key, `${context}.codexAudit`);
  });
  if (!item.codexAudit?.summary?.zh || !item.codexAudit?.summary?.en) {
    errors.push(`${context}: codexAudit.summary must be bilingual`);
  }
  if (!Array.isArray(item.codexAudit?.inputScope) || item.codexAudit.inputScope.length === 0) {
    errors.push(`${context}: codexAudit.inputScope must be a non-empty array`);
  }
  if (snapshot.marketContext?.newsEventsSource) {
    if (!item.newsEvents || !Array.isArray(item.newsEvents.items)) {
      errors.push(`${context}: live snapshot must include newsEvents.items`);
    }
  }
});

["mixed", "ultra", "benchmark"].forEach((strategy) => {
  const assumptions = snapshot.simulationAssumptions?.[strategy];
  if (!assumptions) {
    errors.push(`simulationAssumptions.${strategy}: missing`);
    return;
  }
  if (!Array.isArray(assumptions.monthlyReturns) || assumptions.monthlyReturns.length !== 12) {
    errors.push(`simulationAssumptions.${strategy}: monthlyReturns must contain 12 values`);
  }
  if (typeof assumptions.volatility !== "number" || assumptions.volatility <= 0) {
    errors.push(`simulationAssumptions.${strategy}: volatility must be positive`);
  }
  if (!Array.isArray(assumptions.trades) || assumptions.trades.length === 0) {
    errors.push(`simulationAssumptions.${strategy}: trades must be non-empty`);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Snapshot ${snapshot.snapshotId} is valid (${snapshot.recommendations.length} recommendations).`);
