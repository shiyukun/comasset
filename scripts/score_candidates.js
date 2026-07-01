const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const outputPath = process.argv[3] || path.join(root, "snapshots", "scored-2026-W25.json");
const configPath = process.argv[4] || path.join(root, "config", "app_config.json");
const pricePath = process.argv[5] || path.join(root, "data", "prices_sample.json");
const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const priceData = fs.existsSync(pricePath) ? JSON.parse(fs.readFileSync(pricePath, "utf8")) : { prices: {} };

const modelVersion = config.scoring.modelVersion;
const codexAuditSkillVersion = config.scoring.codexAuditSkillVersion;
const baseWeights = config.scoring.baseWeights;
const horizonAdjustments = config.scoring.horizonAdjustments;
const usesLiveData = raw.sourceMode === "real_data_enriched";

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

function seriesReturns(series) {
  return series.slice(1).map((point, index) => point.close / series[index].close - 1);
}

function returnOver(series, periods) {
  if (!series || series.length <= periods) return null;
  const end = series.at(-1).close;
  const start = series.at(-1 - periods).close;
  return start > 0 ? end / start - 1 : null;
}

function maxDrawdown(series) {
  let peak = -Infinity;
  let drawdown = 0;
  series.forEach((point) => {
    peak = Math.max(peak, point.close);
    drawdown = Math.min(drawdown, point.close / peak - 1);
  });
  return drawdown;
}

function stdev(values) {
  if (values.length < 2) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function scoreFromMomentum(series) {
  const oneWeek = returnOver(series, 1) ?? 0;
  const oneMonth = returnOver(series, 4) ?? oneWeek;
  const threeMonth = returnOver(series, 12) ?? oneMonth;
  const rawScore = 50 + oneWeek * 220 + oneMonth * 140 + threeMonth * 90;
  return clamp(Math.round(rawScore), 0, 100);
}

function scoreFromRisk(series) {
  const returns = seriesReturns(series);
  const annualizedVol = stdev(returns) * Math.sqrt(52);
  const drawdown = Math.abs(maxDrawdown(series));
  const rawScore = 100 - annualizedVol * 130 - drawdown * 180;
  return clamp(Math.round(rawScore), 0, 100);
}

function enrichCandidateWithPrices(candidate) {
  const series = priceData.prices?.[candidate.ticker];
  if (!Array.isArray(series) || series.length < 5) {
    return {
      ...candidate,
      priceSignals: {
        status: "missing",
        points: Array.isArray(series) ? series.length : 0,
      },
    };
  }
  const momentum = scoreFromMomentum(series);
  const riskControl = scoreFromRisk(series);
  return {
    ...candidate,
    price: series.at(-1).close,
    metrics: {
      ...candidate.metrics,
      momentum,
      riskControl,
    },
    priceSignals: {
      status: "ready",
      points: series.length,
      oneWeekReturn: returnOver(series, 1),
      oneMonthReturn: returnOver(series, 4),
      threeMonthReturn: returnOver(series, 12),
      maxDrawdown: maxDrawdown(series),
      annualizedVolatility: stdev(seriesReturns(series)) * Math.sqrt(52),
    },
  };
}

function confidenceFromScore(score) {
  if (score >= config.scoring.confidenceThresholds.high) return "high";
  if (score >= config.scoring.confidenceThresholds.medium) return "medium";
  return "low";
}

function actionFromScore(candidate, score) {
  if (score < config.scoring.minimumScoreForDca) return "watch";
  if ((candidate.type === "fund" || candidate.type === "etf") && candidate.horizon === "ultra") return "dca";
  if (score >= config.scoring.minimumScoreForBuy) return "buy";
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

function defaultSimulationAssumptions(recommendations = []) {
  const mixedTrades = recommendations.slice(0, 5).map((item) => item.ticker);
  const ultraTrades = recommendations
    .filter((item) => item.horizon === "ultra")
    .slice(0, 4)
    .map((item) => item.ticker);
  return {
    mixed: {
      monthlyReturns: [0.018, 0.011, -0.016, 0.028, 0.021, 0.012, 0.031, -0.011, 0.024, 0.019, 0.017, 0.022],
      volatility: 0.145,
      trades: mixedTrades.length ? mixedTrades : ["MSFT", "VTI", "QQQM", "COST"],
    },
    ultra: {
      monthlyReturns: [0.012, 0.009, -0.01, 0.018, 0.015, 0.011, 0.019, -0.007, 0.017, 0.014, 0.013, 0.016],
      volatility: 0.105,
      trades: ultraTrades.length ? ultraTrades : ["MSFT", "VTI", "VFIAX"],
    },
    benchmark: {
      monthlyReturns: [0.01, 0.006, -0.013, 0.017, 0.012, 0.008, 0.018, -0.009, 0.014, 0.011, 0.01, 0.013],
      volatility: 0.128,
      trades: ["SPY"],
    },
    qqq: {
      monthlyReturns: [0.014, 0.011, -0.019, 0.024, 0.019, 0.01, 0.026, -0.014, 0.021, 0.016, 0.014, 0.018],
      volatility: 0.17,
      trades: ["QQQ"],
    },
    cash: {
      monthlyReturns: [0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032, 0.0032],
      volatility: 0.01,
      trades: ["CASH"],
    },
  };
}

function isoWeekId(dateText) {
  const date = new Date(`${String(dateText).slice(0, 10)}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function codexAuditFor(candidate) {
  if (candidate.codexAudit) return candidate.codexAudit;
  return {
    skillVersion: codexAuditSkillVersion,
    calledAt: raw.generatedAt,
    inputScope: ["factor_scores"],
    summary: {
      zh: "尚未完成 Codex Public Equity Investing skill 审计。",
      en: "Codex Public Equity Investing skill audit has not been completed yet.",
    },
    conflicts: [],
    provider: "not_reviewed",
    status: "needs_codex_review",
  };
}

const factorLabels = {
  fundamentals: { zh: "基本面", en: "fundamentals" },
  valuation: { zh: "估值", en: "valuation" },
  momentum: { zh: "价格动量", en: "price momentum" },
  fundQuality: { zh: "基金质量", en: "fund quality" },
  macroSensitivity: { zh: "宏观适应性", en: "macro resilience" },
  riskControl: { zh: "风险控制", en: "risk control" },
};

function structuredAnalysis(candidate, score) {
  const ranked = Object.entries(candidate.metrics || {})
    .filter(([key, value]) => factorLabels[key] && typeof value === "number")
    .sort((a, b) => b[1] - a[1]);
  const strongest = ranked.slice(0, 2);
  const weakest = ranked.at(-1);
  const strongZh = strongest.map(([key, value]) => `${factorLabels[key].zh} ${Math.round(value)}`).join("、");
  const strongEn = strongest.map(([key, value]) => `${factorLabels[key].en} ${Math.round(value)}`).join(" and ");
  const weakZh = weakest ? `${factorLabels[weakest[0]].zh} ${Math.round(weakest[1])}` : "数据覆盖不足";
  const weakEn = weakest ? `${factorLabels[weakest[0]].en} ${Math.round(weakest[1])}` : "limited data coverage";
  return {
    generatedAt: raw.generatedAt,
    provider: "comasset_deterministic_factor_analysis",
    score,
    strongestFactors: strongest.map(([factor, value]) => ({ factor, value })),
    weakestFactor: weakest ? { factor: weakest[0], value: weakest[1] } : null,
    summary: {
      zh: `最新结构化评分 ${score}/100；相对优势为${strongZh || "暂无"}，主要约束为${weakZh}。`,
      en: `Latest structured score is ${score}/100; relative strengths are ${strongEn || "not available"}, while the main constraint is ${weakEn}.`,
    },
  };
}

function analyzedReason(candidate, analysis) {
  return {
    zh: `${analysis.summary.zh}${candidate.reason?.zh ? ` ${candidate.reason.zh}` : ""}`,
    en: `${analysis.summary.en}${candidate.reason?.en ? ` ${candidate.reason.en}` : ""}`,
  };
}

function compactTimestamp(value) {
  return new Date(value || Date.now()).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

const enrichedCandidates = raw.candidates.map(enrichCandidateWithPrices);

const recommendations = enrichedCandidates
  .map((candidate) => {
    const score = scoreCandidate(candidate);
    const structured = structuredAnalysis(candidate, score);
    return {
      ticker: candidate.ticker,
      name: candidate.name,
      type: candidate.type,
      market: candidate.market || "US",
      exchange: candidate.exchange || null,
      country: candidate.country || (candidate.currency === "SGD" ? "SG" : "US"),
      horizon: candidate.horizon,
      action: actionFromScore(candidate, score),
      score: clamp(score, 0, 100),
      confidence: confidenceFromScore(score),
      price: candidate.price,
      currency: candidate.currency || "USD",
      expectedRange: candidate.expectedRange,
      positionHint: candidate.positionHint,
      factorScores: candidate.metrics,
      priceSignals: candidate.priceSignals,
      reason: analyzedReason(candidate, structured),
      structuredAnalysis: structured,
      risks: candidate.risks,
      exitRules: candidate.exitRules,
      holdings: candidate.holdings,
      newsEvents: candidate.newsEvents,
      codexAudit: codexAuditFor(candidate),
    };
  })
  .sort((a, b) => b.score - a.score);

const snapshot = {
  snapshotId: usesLiveData
    ? `${isoWeekId(raw.asOf || new Date().toISOString())}-scored-${compactTimestamp(raw.generatedAt)}`
    : config.weeklySnapshot.snapshotId,
  asOf: usesLiveData ? raw.asOf : config.weeklySnapshot.asOf || raw.asOf,
  generatedAt: usesLiveData ? raw.generatedAt : config.weeklySnapshot.generatedAt || raw.generatedAt,
  modelVersion,
  codexAuditSkillVersion,
  dataCutoff: usesLiveData ? raw.dataCutoff : config.weeklySnapshot.dataCutoff || raw.dataCutoff,
  marketContext: {
    baseCurrency: config.familyProfile.baseCurrency,
    benchmark: config.familyProfile.defaultBenchmark,
    updateCadence: config.weeklySnapshot.updateCadence,
    source: "data/raw_candidates.json",
    priceSource: path.relative(root, pricePath),
    newsEventsSource: usesLiveData ? "data/live_news_events.json" : null,
  },
  recommendations,
  factorValues: aggregateFactorValues(recommendations),
  simulationAssumptions: defaultSimulationAssumptions(recommendations),
  inputFingerprint: process.env.COMASSET_INPUT_FINGERPRINT || null,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Scored ${recommendations.length} candidates into ${path.relative(root, outputPath)}.`);
