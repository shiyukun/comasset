const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const rawPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const pricesPath = process.argv[3] || path.join(root, "data", "live_prices.json");
const fundamentalsPath = process.argv[4] || path.join(root, "data", "live_fundamentals.json");
const holdingsPath = process.argv[5] || path.join(root, "data", "live_holdings.json");
const macroPath = process.argv[6] || path.join(root, "data", "live_macro.json");
const outputPath = process.argv[7] || path.join(root, "data", "raw_candidates_live.json");
const newsEventsPath = process.argv[8] || path.join(root, "data", "live_news_events.json");

function readOptionalJson(filePath, fallback) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function latestPrice(prices, ticker) {
  const series = prices.prices?.[ticker];
  return Array.isArray(series) && series.length ? series.at(-1).close : null;
}

function macroScore(macro) {
  const tenYear = macro.series?.tenYearYield?.latest?.value;
  const vix = macro.series?.vix?.latest?.value;
  if (typeof tenYear !== "number" && typeof vix !== "number") return null;
  const ratePenalty = typeof tenYear === "number" ? Math.max(0, tenYear - 4) * 8 : 0;
  const vixPenalty = typeof vix === "number" ? Math.max(0, vix - 15) * 1.8 : 0;
  return clamp(Math.round(86 - ratePenalty - vixPenalty), 0, 100);
}

function fundQualityScore(fund) {
  if (!fund) return null;
  const expenseRatio = fund.expenseRatio || 0;
  const top10Weight = fund.top10Weight || 0;
  return clamp(Math.round(92 - expenseRatio * 250 - Math.max(0, top10Weight - 0.35) * 35), 0, 100);
}

function holdingsSummary(fund) {
  if (!fund?.holdings?.length) return null;
  return {
    asOf: fund.asOf || null,
    sourceType: fund.sourceType || null,
    source: fund.source || null,
    holdingsCount: fund.holdings.length,
    top10Weight: fund.top10Weight || 0,
    sectorExposure: fund.sectorExposure || {},
    topHoldings: fund.holdings.slice(0, 10).map((holding) => ({
      ticker: holding.ticker,
      name: holding.name,
      weight: holding.weight,
      sector: holding.sector,
      country: holding.country,
      shares: holding.shares,
      marketValue: holding.marketValue,
      identifierType: holding.identifierType,
    })),
  };
}

function newsEventsSummary(newsEvents, ticker) {
  const symbol = newsEvents.symbols?.[ticker];
  if (!symbol?.items?.length) {
    return {
      status: "missing",
      asOf: newsEvents.asOf || null,
      itemCount: 0,
      highImpactCount: 0,
      latestPublishedAt: null,
      items: [],
    };
  }
  return {
    status: "ready",
    asOf: newsEvents.asOf || null,
    itemCount: symbol.itemCount,
    highImpactCount: symbol.highImpactCount,
    latestPublishedAt: symbol.latestPublishedAt,
    items: symbol.items.slice(0, 12),
  };
}

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const prices = readOptionalJson(pricesPath, { prices: {} });
const fundamentals = readOptionalJson(fundamentalsPath, { companies: {} });
const holdings = readOptionalJson(holdingsPath, { funds: {} });
const macro = readOptionalJson(macroPath, { series: {} });
const newsEvents = readOptionalJson(newsEventsPath, { symbols: {} });
const macroSensitivity = macroScore(macro);

const candidates = raw.candidates.map((candidate) => {
  const ticker = candidate.ticker;
  const company = fundamentals.companies?.[ticker];
  const fund = holdings.funds?.[ticker];
  const tickerNewsEvents = newsEventsSummary(newsEvents, ticker);
  const price = latestPrice(prices, ticker);
  const nextMetrics = { ...candidate.metrics };

  if (company?.metrics?.fundamentalsScore !== undefined) {
    nextMetrics.fundamentals = company.metrics.fundamentalsScore;
  }
  if (company?.metrics?.riskScore !== undefined) {
    nextMetrics.riskControl = Math.round((nextMetrics.riskControl + company.metrics.riskScore) / 2);
  }
  const qualityScore = fundQualityScore(fund);
  if (qualityScore !== null && (candidate.type === "etf" || candidate.type === "fund")) {
    nextMetrics.fundQuality = qualityScore;
  }
  if (macroSensitivity !== null) {
    nextMetrics.macroSensitivity = Math.round((nextMetrics.macroSensitivity + macroSensitivity) / 2);
  }

  return {
    ...candidate,
    price: price || candidate.price,
    metrics: nextMetrics,
    holdings: holdingsSummary(fund) || candidate.holdings,
    newsEvents: tickerNewsEvents,
    dataInputs: {
      prices: price ? prices.source || path.relative(root, pricesPath) : null,
      fundamentals: company ? fundamentals.source || path.relative(root, fundamentalsPath) : null,
      holdings: fund ? holdings.source || path.relative(root, holdingsPath) : null,
      macro: macroSensitivity !== null ? macro.source || path.relative(root, macroPath) : null,
      newsEvents: tickerNewsEvents.status === "ready" ? path.relative(root, newsEventsPath) : null,
    },
  };
});

const output = {
  ...raw,
  asOf: prices.asOf || raw.asOf,
  generatedAt: new Date().toISOString(),
  dataCutoff: prices.asOf || raw.dataCutoff,
  sourceMode: "real_data_enriched",
  candidates,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)} with ${candidates.length} real-data enriched candidates.`);
