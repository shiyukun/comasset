const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "scored-2026-W25.json");
const rawPath = process.argv[3] || path.join(root, "data", "raw_candidates.json");
const statusPath = path.resolve(root, process.argv[4] || path.join("web", "data_status.js"));
const outputPath = process.argv[5] || path.join(root, "reports", "2026-W25-scored.md");
const holdingsPath = process.argv[6] || path.join(root, "data", "live_holdings.json");
const simulationRunPath = process.argv[7] || path.join(root, "data", "simulation_runs", "latest.json");

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const holdings = fs.existsSync(holdingsPath) ? JSON.parse(fs.readFileSync(holdingsPath, "utf8")) : { funds: {} };
const simulationRun = fs.existsSync(simulationRunPath) ? JSON.parse(fs.readFileSync(simulationRunPath, "utf8")) : null;

global.window = {};
require(statusPath);
const dataStatus = global.window.comassetDataStatus;

const rawTickers = new Set(raw.candidates.map((item) => item.ticker));
const selectedTickers = new Set(snapshot.recommendations.map((item) => item.ticker));
const excluded = [...rawTickers].filter((ticker) => !selectedTickers.has(ticker));
const blockedSources = dataStatus.sources.filter((source) => source.status === "blocked");
const reviewSources = dataStatus.sources.filter((source) => source.status === "review");
const lowCoverage = dataStatus.sources.filter((source) => source.coverage < 0.7);

function sectionList(items, emptyText = "None") {
  if (!items.length) return `- ${emptyText}`;
  return items.map((item) => `- ${item}`).join("\n");
}

function formatPercent(value) {
  if (typeof value !== "number") return "n/a";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatExposure(exposure = {}) {
  const entries = Object.entries(exposure)
    .filter(([, value]) => typeof value === "number" && value > 0)
    .slice(0, 3);
  if (!entries.length) return "n/a";
  return entries.map(([name, value]) => `${name} ${(value * 100).toFixed(1)}%`).join(", ");
}

function sourceLabel(sourceType) {
  const labels = {
    issuer_csv: "issuer CSV",
    sec_nport: "SEC N-PORT",
  };
  return labels[sourceType] || sourceType || "n/a";
}

function strategyLabel(key) {
  const labels = {
    mixed: "Mixed recommendations",
    ultra: "Ultra-long only",
    benchmark: "SPY benchmark",
    qqq: "QQQ benchmark",
    cash: "Cash",
  };
  return labels[key] || key;
}

function calculateSimulation(strategyKey) {
  const assumptions = snapshot.simulationAssumptions?.[strategyKey];
  if (!assumptions) return null;
  const initialCapital = 10000;
  const monthlyContribution = 500;
  let value = initialCapital;
  let returnIndex = 1;
  let peakReturnIndex = 1;
  let maxDrawdown = 0;
  let turnover = 0;

  assumptions.monthlyReturns.forEach((monthlyReturn) => {
    value += monthlyContribution;
    value *= 1 + monthlyReturn;
    returnIndex *= 1 + monthlyReturn;
    peakReturnIndex = Math.max(peakReturnIndex, returnIndex);
    maxDrawdown = Math.min(maxDrawdown, (returnIndex - peakReturnIndex) / peakReturnIndex);
    turnover += assumptions.trades.length;
  });

  const invested = initialCapital + monthlyContribution * assumptions.monthlyReturns.length;
  const totalReturn = invested > 0 ? (value - invested) / invested : 0;
  return {
    strategy: strategyKey,
    finalValue: value,
    totalReturn,
    maxDrawdown,
    turnover,
  };
}

const topPicks = snapshot.recommendations
  .slice(0, 10)
  .map(
    (item, index) =>
      `${index + 1}. ${item.ticker} (${item.market || "US"}, ${item.currency || "USD"}, ${item.type}, ${
        item.horizon
      }) - score ${item.score}, ${item.action}`
  );

const watchList = snapshot.recommendations
  .filter((item) => item.action === "watch")
  .map((item) => {
    const firstRisk = item.risks?.en?.[0] || item.risks?.zh?.[0] || "needs review";
    return `${item.ticker} - watch; main risk: ${firstRisk}`;
  });

const missingPriceSignals = snapshot.recommendations
  .filter((item) => item.priceSignals?.status !== "ready")
  .map((item) => `${item.ticker} - ${item.priceSignals?.points || 0} price points`);

const priceSignals = snapshot.recommendations
  .filter((item) => item.priceSignals?.status === "ready")
  .map(
    (item) =>
      `${item.ticker} - 1w ${formatPercent(item.priceSignals.oneWeekReturn)}, 1m ${formatPercent(
        item.priceSignals.oneMonthReturn
      )}, max drawdown ${formatPercent(item.priceSignals.maxDrawdown)}`
  );

const strategyComparisons = simulationRun
  ? [
      `${strategyLabel(simulationRun.strategy)} - historical snapshot backtest ${simulationRun.period.start} to ${
        simulationRun.period.end
      }, final ${formatCurrency(simulationRun.summary.finalValue)}, time-weighted return ${formatPercent(
        simulationRun.summary.timeWeightedReturn
      )}, max drawdown ${formatPercent(simulationRun.summary.maxDrawdown)}, trades ${
        simulationRun.summary.turnoverTrades
      }, snapshots ${(simulationRun.sourceSnapshotIds || []).join(", ")}`,
    ]
  : ["mixed", "ultra", "benchmark", "qqq", "cash"]
      .map(calculateSimulation)
      .filter(Boolean)
      .map(
        (item) =>
          `${strategyLabel(item.strategy)} - projection fallback ${formatCurrency(
            item.finalValue
          )}, total return ${formatPercent(item.totalReturn)}, max drawdown ${formatPercent(
            item.maxDrawdown
          )}, turnover ${item.turnover}`
      );

const newsEventSummaries = snapshot.recommendations.map((item) => {
  const events = item.newsEvents?.items || [];
  if (!events.length) return `${item.ticker} - no current news/events in the configured lookback window`;
  const top = events
    .slice(0, 3)
    .map((event) => `${event.publishedAt.slice(0, 10)} ${event.category}/${event.impact}: ${event.headline}`)
    .join(" | ");
  return `${item.ticker} - ${item.newsEvents.itemCount} items, ${item.newsEvents.highImpactCount} high impact; ${top}`;
});
const newsReadyCount = snapshot.recommendations.filter((item) => item.newsEvents?.items?.length).length;

const fundRecommendations = snapshot.recommendations.filter((item) => item.type === "etf" || item.type === "fund");
const holdingsReady = fundRecommendations.filter((item) => holdings.funds?.[item.ticker]?.holdings?.length > 0);
const holdingsSummaries = fundRecommendations.map((item) => {
  const fund = holdings.funds?.[item.ticker];
  if (!fund?.holdings?.length) return `${item.ticker} - holdings missing`;
  const topHoldings = fund.holdings
    .slice(0, 3)
    .map((holding) => `${holding.name || holding.ticker} ${(holding.weight * 100).toFixed(1)}%`)
    .join(", ");
  return `${item.ticker} - ${sourceLabel(fund.sourceType)}, as of ${fund.asOf || "n/a"}, holdings ${
    fund.holdings.length
  }, top 10 weight ${(fund.top10Weight * 100).toFixed(1)}%, main exposure ${formatExposure(
    fund.sectorExposure
  )}, top holdings ${topHoldings || "n/a"}`;
});
const codexAuditSummaries = snapshot.recommendations.map((item) => {
  const audit = item.codexAudit || {};
  const provider = audit.provider || "manual_or_legacy";
  const status = audit.status || "not_api_reviewed";
  const warnings = audit.missingDataWarnings?.length ? `, warnings ${audit.missingDataWarnings.length}` : "";
  return `${item.ticker}: ${audit.skillVersion || snapshot.codexAuditSkillVersion}, ${provider}, ${status}, ${(
    audit.inputScope || []
  ).join(", ")}${warnings}`;
});
const priceSource = snapshot.marketContext?.priceSource || "n/a";
const priceAction = priceSource.includes("live")
  ? "Review live price fetch quality and confirm adjusted-close treatment before real decisions."
  : "Replace sample price data with an imported weekly price file before using the report for real decisions.";

const report = `# Recommendation Report: ${snapshot.snapshotId}

Generated at: ${snapshot.generatedAt}  
Data cutoff: ${snapshot.dataCutoff}  
Model: ${snapshot.modelVersion}  
Codex audit skill: ${snapshot.codexAuditSkillVersion}
Price source: ${priceSource}

## Summary

- Raw candidates: ${raw.candidates.length}
- Selected recommendations: ${snapshot.recommendations.length}
- Excluded candidates: ${excluded.length}
- Blocked data sources: ${blockedSources.length}
- Review data sources: ${reviewSources.length}
- Price-ready recommendations: ${snapshot.recommendations.length - missingPriceSignals.length}
- Holdings-ready ETF/funds: ${holdingsReady.length}/${fundRecommendations.length}
- News/event-ready recommendations: ${newsReadyCount}/${snapshot.recommendations.length}

## Top Picks

${sectionList(topPicks)}

## Watch / No Immediate Action

${sectionList(watchList, "No watch-only recommendations")}

## Price Signals

${sectionList(priceSignals, "No price signals available")}

## ETF / Fund Holdings

${sectionList(holdingsSummaries, "No ETF or mutual fund recommendations in this snapshot")}

## News and Events

${sectionList(newsEventSummaries, "No news or events available")}

## Missing Price Signals

${sectionList(missingPriceSignals, "All selected recommendations have usable price series")}

## Strategy Simulation

Assumptions: $10,000 initial capital, $500 monthly contribution, monthly rebalance, 0.05% slippage, no tax impact. Historical mode only uses snapshots generated before each simulated trade date.

${sectionList(strategyComparisons, "No strategy assumptions found")}

## Excluded Candidates

${sectionList(excluded)}

## Data Sources Requiring Review

${sectionList(reviewSources.map((source) => `${source.name} (${source.provider}) - ${(source.coverage * 100).toFixed(0)}% coverage`))}

## Blocked Data Sources

${sectionList(blockedSources.map((source) => `${source.name} (${source.provider}) - ${source.notes.en}`))}

## Low Coverage Sources

${sectionList(lowCoverage.map((source) => `${source.name} - ${(source.coverage * 100).toFixed(0)}% coverage`))}

## Codex Audit Coverage

${sectionList(codexAuditSummaries)}

## Next Actions

- Review blocked or low-coverage sources before trusting short-term recommendations.
- Review watch-only names before taking any action; they are included for monitoring, not immediate purchase.
- Confirm ETF and mutual fund holding overlap before adding to family portfolio.
- ${priceAction}
- Re-run snapshot validation after any manual data edits.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, report);
console.log(`Wrote ${path.relative(root, outputPath)}.`);
