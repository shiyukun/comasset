const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const watchlistPath = process.argv[2] || path.join(root, "data", "custom_watchlist_live.json");
const snapshotPath = process.argv[3] || path.join(root, "snapshots", "latest.json");

const watchlist = JSON.parse(fs.readFileSync(watchlistPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const requiredTickers = ["GRAB", "SPCX", "AIQ"];
const requiredHorizons = ["sixMonths", "oneYear", "twoPlusYears"];
const allowedActions = new Set(["buy", "hold", "sell"]);
const errors = [];
const items = watchlist.items || [];
const recommendationTickers = new Set((snapshot.recommendations || []).map((item) => item.ticker));

requiredTickers.forEach((ticker) => {
  const item = items.find((candidate) => candidate.ticker === ticker);
  if (!item) {
    errors.push(`${ticker}: missing from custom watchlist`);
    return;
  }
  if (item.recommendationEligible !== false) errors.push(`${ticker}: recommendationEligible must be false`);
  if (item.backtestEligible !== false) errors.push(`${ticker}: backtestEligible must be false`);
  if (recommendationTickers.has(ticker)) errors.push(`${ticker}: leaked into recommendation snapshot`);
  if (item.priceSignals?.status !== "ready") errors.push(`${ticker}: live price data is not ready`);
  if (item.newsEvents?.status !== "ready") errors.push(`${ticker}: live news/events are not ready`);
  requiredHorizons.forEach((horizon) => {
    const recommendation = item.horizonRecommendations?.[horizon];
    if (!recommendation) {
      errors.push(`${ticker}: ${horizon} recommendation is missing`);
      return;
    }
    if (!allowedActions.has(recommendation.action)) {
      errors.push(`${ticker}: ${horizon} action must be buy, hold, or sell`);
    }
    if (!recommendation.rationale?.zh || !recommendation.rationale?.en) {
      errors.push(`${ticker}: ${horizon} rationale must be bilingual`);
    }
    if (!recommendation.upgradeTrigger?.zh || !recommendation.downgradeTrigger?.zh) {
      errors.push(`${ticker}: ${horizon} action-change triggers are incomplete`);
    }
  });
});

const aiq = items.find((item) => item.ticker === "AIQ");
if (!aiq?.holdings?.holdingsCount) errors.push("AIQ: official holdings are not ready");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${items.length} custom watchlist items; none appear in ${recommendationTickers.size} recommendations.`);
