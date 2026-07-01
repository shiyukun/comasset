const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const watchlistPath = process.argv[2] || path.join(root, "data", "custom_watchlist.json");
const pricesPath = process.argv[3] || path.join(root, "data", "live_prices.json");
const newsPath = process.argv[4] || path.join(root, "data", "live_news_events.json");
const holdingsPath = process.argv[5] || path.join(root, "data", "live_holdings.json");
const outputPath = process.argv[6] || path.join(root, "data", "custom_watchlist_live.json");
const webJsPath = process.argv[7] || path.join(root, "web", "watchlist.js");
const webJsonPath = process.argv[8] || path.join(root, "web", "watchlist.json");
const fundamentalsPath = process.argv[9] || path.join(root, "data", "live_fundamentals.json");

function readJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

function returnOver(series, periods) {
  if (!Array.isArray(series) || series.length <= periods) return null;
  const start = series.at(-1 - periods).close;
  const end = series.at(-1).close;
  return start > 0 ? end / start - 1 : null;
}

function maxDrawdown(series) {
  if (!Array.isArray(series) || !series.length) return null;
  let peak = -Infinity;
  let drawdown = 0;
  series.forEach((point) => {
    peak = Math.max(peak, point.close);
    drawdown = Math.min(drawdown, point.close / peak - 1);
  });
  return drawdown;
}

function stdev(values) {
  if (values.length < 2) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function priceSummary(series) {
  if (!Array.isArray(series) || !series.length) {
    return { status: "missing", points: 0, price: null, asOf: null };
  }
  const returns = series.slice(1).map((point, index) => point.close / series[index].close - 1);
  return {
    status: "ready",
    points: series.length,
    price: series.at(-1).close,
    asOf: series.at(-1).date,
    oneWeekReturn: returnOver(series, 1),
    oneMonthReturn: returnOver(series, 4),
    threeMonthReturn: returnOver(series, 12),
    maxDrawdown: maxDrawdown(series),
    annualizedVolatility: returns.length > 1 ? stdev(returns) * Math.sqrt(52) : null,
  };
}

function holdingsSummary(fund) {
  if (!fund?.holdings?.length) return null;
  return {
    status: "ready",
    asOf: fund.asOf || null,
    sourceType: fund.sourceType || null,
    expenseRatio: fund.expenseRatio ?? null,
    holdingsCount: fund.holdings.length,
    top10Weight: fund.top10Weight || 0,
    sectorExposure: fund.sectorExposure || {},
    topHoldings: fund.holdings.slice(0, 10),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function priceSignalScore(priceSignals) {
  if (priceSignals.status !== "ready") return null;
  const oneMonth = priceSignals.oneMonthReturn ?? priceSignals.oneWeekReturn ?? 0;
  const threeMonth = priceSignals.threeMonthReturn ?? oneMonth;
  return clamp(Math.round(50 + oneMonth * 110 + threeMonth * 75), 0, 100);
}

function fundQualityScore(fund) {
  if (!fund) return null;
  return clamp(
    Math.round(88 - (fund.expenseRatio || 0) * 1800 - Math.max(0, (fund.top10Weight || 0) - 0.35) * 45),
    0,
    100
  );
}

function liveHorizonAnalysis(item, baseDecision, horizon, inputs) {
  const momentum = priceSignalScore(inputs.priceSignals);
  const fundamentals = inputs.company?.metrics?.fundamentalsScore ?? fundQualityScore(inputs.fundHoldings);
  const risk = inputs.company?.metrics?.riskScore ?? clamp(
    Math.round(88 - Math.abs(inputs.priceSignals.annualizedVolatility || 0) * 80),
    0,
    100
  );
  const eventPenalty = Math.min(20, (inputs.tickerNews?.highImpactCount || 0) * 4);
  const weights = {
    sixMonths: { momentum: 0.55, fundamentals: 0.2, risk: 0.25 },
    oneYear: { momentum: 0.3, fundamentals: 0.4, risk: 0.3 },
    twoPlusYears: { momentum: 0.1, fundamentals: 0.55, risk: 0.35 },
  }[horizon];
  const available = { momentum, fundamentals, risk };
  let weighted = 0;
  let totalWeight = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    if (typeof available[key] === "number") {
      weighted += available[key] * weight;
      totalWeight += weight;
    }
  });
  const score = totalWeight ? clamp(Math.round(weighted / totalWeight - eventPenalty), 0, 100) : null;
  const evidenceCount = [momentum, fundamentals, risk].filter((value) => typeof value === "number").length;
  const confidence = evidenceCount === 3 && inputs.priceSignals.points >= 12 ? "medium" : "low";
  const evidenceCanChangeAction = evidenceCount >= 2 && (
    inputs.priceSignals.points >= 12 || typeof fundamentals === "number"
  );
  const action = score === null || !evidenceCanChangeAction
    ? baseDecision.action
    : score >= 68
      ? "buy"
      : score <= 42
        ? "sell"
        : "hold";
  const scoreText = score === null ? "N/A" : `${score}/100`;
  const liveSummary = {
    zh: `实时数据复核 ${scoreText}：动量 ${momentum ?? "N/A"}、基本面或基金质量 ${fundamentals ?? "N/A"}、风险韧性 ${risk ?? "N/A"}，事件扣分 ${eventPenalty}。`,
    en: `Live-data review ${scoreText}: momentum ${momentum ?? "N/A"}, fundamentals or fund quality ${fundamentals ?? "N/A"}, risk resilience ${risk ?? "N/A"}, and event penalty ${eventPenalty}.`,
  };
  return {
    ...baseDecision,
    action,
    confidence,
    liveScore: score,
    analysisProvider: "comasset_deterministic_horizon_analysis_v1",
    analysisInputs: { momentum, fundamentals, risk, eventPenalty },
    rationale: {
      zh: `${liveSummary.zh} ${baseDecision.rationale?.zh || ""}`.trim(),
      en: `${liveSummary.en} ${baseDecision.rationale?.en || ""}`.trim(),
    },
  };
}

const watchlist = JSON.parse(fs.readFileSync(watchlistPath, "utf8"));
const prices = readJson(pricesPath, { prices: {}, currencies: {} });
const news = readJson(newsPath, { symbols: {} });
const holdings = readJson(holdingsPath, { funds: {} });
const fundamentals = readJson(fundamentalsPath, { companies: {} });
const generatedAt = new Date().toISOString();

const items = (watchlist.items || []).map((item) => {
  const priceSignals = priceSummary(prices.prices?.[item.ticker]);
  const tickerNews = news.symbols?.[item.ticker];
  const fundHoldings = holdingsSummary(holdings.funds?.[item.ticker]);
  const company = fundamentals.companies?.[item.ticker];
  const newsItems = tickerNews?.items || [];
  const evidenceGaps = [];
  if (priceSignals.points < 5) evidenceGaps.push("short_price_history");
  if (!newsItems.length) evidenceGaps.push("news_events_missing");
  if (item.type === "etf" && !fundHoldings) evidenceGaps.push("official_holdings_missing");
  if (item.type === "stock" && !company) evidenceGaps.push("normalized_fundamentals_not_in_watchlist_pipeline");

  const analysisInputs = { priceSignals, tickerNews, fundHoldings, company };
  const horizonRecommendations = Object.fromEntries(
    Object.entries(item.horizonRecommendations || {}).map(([horizon, decision]) => [
      horizon,
      liveHorizonAnalysis(item, decision, horizon, analysisInputs),
    ])
  );

  return {
    ...item,
    horizonRecommendations,
    priceSignals,
    currency: prices.currencies?.[item.ticker] || item.currency || "USD",
    newsEvents: {
      status: newsItems.length ? "ready" : "missing",
      asOf: news.asOf || null,
      itemCount: tickerNews?.itemCount || 0,
      highImpactCount: tickerNews?.highImpactCount || 0,
      items: newsItems.slice(0, 8),
    },
    holdings: fundHoldings,
    fundamentals: company
      ? {
          status: "ready",
          asOf: company.periodEnd || fundamentals.asOf || null,
          metrics: company.metrics,
        }
      : { status: "missing" },
    evidenceGaps,
    analysisConfidence:
      priceSignals.points >= 12 && newsItems.length && (item.type !== "etf" || fundHoldings) ? "medium" : "low",
    workflowAudit: {
      workflow: "Comasset deterministic horizon refresh",
      version: "0.1.29",
      reviewedAt: generatedAt,
      classification: "user_selected_watchlist_horizon_actions",
      recommendationExcluded: true,
      horizonAnalysisAsOf: generatedAt.slice(0, 10),
      refreshedAt: generatedAt,
      codexBaselineWorkflow: "Codex Public Equity Investing long-short-pitch",
      codexReviewStatus: "needs_review_after_data_refresh",
    },
  };
});

const output = {
  version: watchlist.version,
  generatedAt,
  asOf: prices.asOf || generatedAt.slice(0, 10),
  mode: "custom_watchlist_analysis",
  recommendationPolicy: "These items are user-selected research targets and are excluded from recommendation ranking and backtest selection.",
  horizonAnalysisPolicy:
    watchlist.horizonAnalysisPolicy ||
    "Screen-grade Public Equity Investing judgments for research use; not account-specific trade instructions.",
  sources: {
    definitions: path.relative(root, watchlistPath),
    prices: path.relative(root, pricesPath),
    newsEvents: path.relative(root, newsPath),
    holdings: path.relative(root, holdingsPath),
    fundamentals: path.relative(root, fundamentalsPath),
  },
  items,
};

[outputPath, webJsonPath].forEach((filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`);
});
fs.writeFileSync(webJsPath, `window.comassetWatchlist = ${JSON.stringify(output, null, 2)};\n`);
console.log(`Built custom watchlist analysis for ${items.length} items.`);
console.log(`- ${path.relative(root, outputPath)}`);
console.log(`- ${path.relative(root, webJsPath)}`);
console.log(`- ${path.relative(root, webJsonPath)}`);
