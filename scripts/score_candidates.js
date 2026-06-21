const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const outputPath = process.argv[3] || path.join(root, "snapshots", "scored-2026-W25.json");
const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const modelVersion = "comasset-score-v0.2";
const claudeSkillVersion = "claude-finance-skill-2026.06";

const baseWeights = {
  stock: {
    fundamentals: 0.3,
    valuation: 0.15,
    momentum: 0.15,
    fundQuality: 0,
    macroSensitivity: 0.1,
    riskControl: 0.3,
  },
  etf: {
    fundamentals: 0.15,
    valuation: 0.15,
    momentum: 0.15,
    fundQuality: 0.3,
    macroSensitivity: 0.1,
    riskControl: 0.15,
  },
  fund: {
    fundamentals: 0.15,
    valuation: 0.1,
    momentum: 0.1,
    fundQuality: 0.35,
    macroSensitivity: 0.1,
    riskControl: 0.2,
  },
};

const horizonAdjustments = {
  short: {
    momentum: 0.18,
    riskControl: 0.08,
    fundamentals: -0.08,
    valuation: -0.04,
  },
  long: {
    fundamentals: 0.05,
    valuation: 0.03,
    momentum: -0.04,
    riskControl: 0.02,
  },
  ultra: {
    fundamentals: 0.08,
    fundQuality: 0.08,
    riskControl: 0.08,
    momentum: -0.08,
    macroSensitivity: -0.03,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function weightsFor(candidate) {
  const weights = { ...(baseWeights[candidate.type] || baseWeights.stock) };
  const adjustments = horizonAdjustments[candidate.horizon] || {};
  Object.entries(adjustments).forEach(([key, value]) => {
    weights[key] = (weights[key] || 0) + value;
  });
  Object.keys(weights).forEach((key) => {
    weights[key] = Math.max(0, weights[key]);
  });
  return weights;
}

function scoreCandidate(candidate) {
  const weights = weightsFor(candidate);
  let weighted = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    const value = candidate.metrics[key];
    if (typeof value === "number" && weight > 0) {
      weighted += value * weight;
      totalWeight += weight;
    }
  });

  return Math.round(totalWeight > 0 ? weighted / totalWeight : 0);
}

function confidenceFromScore(score) {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function actionFromScore(candidate, score) {
  if (score < 68) return "watch";
  if ((candidate.type === "fund" || candidate.type === "etf") && candidate.horizon === "ultra") return "dca";
  if (score >= 80) return "buy";
  return "watch";
}

function aggregateFactorValues(recommendations) {
  const keys = ["fundamentals", "valuation", "momentum", "fundQuality", "macroSensitivity", "riskControl"];
  return Object.fromEntries(
    keys.map((key) => {
      const values = recommendations
        .map((item) => item.factorScores[key])
        .filter((value) => typeof value === "number");
      const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
      return [key, average];
    })
  );
}

function defaultSimulationAssumptions() {
  return {
    mixed: {
      monthlyReturns: [0.018, 0.011, -0.016, 0.028, 0.021, 0.012, 0.031, -0.011, 0.024, 0.019, 0.017, 0.022],
      volatility: 0.145,
      trades: ["MSFT", "VTI", "QQQM", "COST", "XLF"],
    },
    ultra: {
      monthlyReturns: [0.012, 0.009, -0.01, 0.018, 0.015, 0.011, 0.019, -0.007, 0.017, 0.014, 0.013, 0.016],
      volatility: 0.105,
      trades: ["MSFT", "VTI", "VFIAX"],
    },
    benchmark: {
      monthlyReturns: [0.01, 0.006, -0.013, 0.017, 0.012, 0.008, 0.018, -0.009, 0.014, 0.011, 0.01, 0.013],
      volatility: 0.128,
      trades: ["SPY"],
    },
  };
}

const recommendations = raw.candidates
  .map((candidate) => {
    const score = scoreCandidate(candidate);
    return {
      ticker: candidate.ticker,
      name: candidate.name,
      type: candidate.type,
      horizon: candidate.horizon,
      action: actionFromScore(candidate, score),
      score: clamp(score, 0, 100),
      confidence: confidenceFromScore(score),
      price: candidate.price,
      currency: candidate.currency || "USD",
      expectedRange: candidate.expectedRange,
      positionHint: candidate.positionHint,
      factorScores: candidate.metrics,
      reason: candidate.reason,
      risks: candidate.risks,
      exitRules: candidate.exitRules,
      claudeAudit: candidate.claudeAudit,
    };
  })
  .sort((a, b) => b.score - a.score);

const snapshot = {
  snapshotId: "2026-W25-scored",
  asOf: raw.asOf,
  generatedAt: raw.generatedAt,
  modelVersion,
  claudeSkillVersion,
  dataCutoff: raw.dataCutoff,
  marketContext: {
    baseCurrency: "USD",
    benchmark: "SPY",
    updateCadence: "weekly",
    source: "data/raw_candidates.json",
  },
  recommendations,
  factorValues: aggregateFactorValues(recommendations),
  simulationAssumptions: defaultSimulationAssumptions(),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Scored ${recommendations.length} candidates into ${path.relative(root, outputPath)}.`);
