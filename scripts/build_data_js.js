const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "latest.json");
const outputPath = process.argv[3] || path.join(root, "web", "data.js");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

function formatPrice(value, currency) {
  if (currency !== "USD") return String(value);
  return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRange(range) {
  if (!range || range.low === null || range.high === null) return "N/A";
  const low = `${range.low >= 0 ? "+" : ""}${Math.round(range.low * 100)}%`;
  const high = `${range.high >= 0 ? "+" : ""}${Math.round(range.high * 100)}%`;
  return `${low} to ${high}`;
}

function formatCalledAt(value) {
  return String(value).replace("T", " ").replace("+08:00", " SGT");
}

function formatInputScope(scope) {
  return (scope || [])
    .map((item) => String(item).replace(/_/g, " "))
    .join(", ");
}

const data = {
  recommendations: snapshot.recommendations.map((item) => ({
    ticker: item.ticker,
    type: item.type,
    horizon: item.horizon,
    score: item.score,
    confidence: item.confidence,
    action: item.action,
    price: formatPrice(item.price, item.currency),
    expectedRange: formatRange(item.expectedRange),
    positionHint: item.positionHint,
    factors: Object.fromEntries(
      Object.entries(item.factorScores).map(([key, value]) => [key, value === null ? 0 : value])
    ),
    reasonZh: item.reason.zh,
    reasonEn: item.reason.en,
    risksZh: item.risks.zh,
    risksEn: item.risks.en,
    exitZh: item.exitRules.zh,
    exitEn: item.exitRules.en,
    claude: {
      version: item.claudeAudit.skillVersion,
      calledAt: formatCalledAt(item.claudeAudit.calledAt),
      inputScope: formatInputScope(item.claudeAudit.inputScope),
      summaryZh: item.claudeAudit.summary.zh,
      summaryEn: item.claudeAudit.summary.en,
    },
  })),
  factorValues: snapshot.factorValues,
  simulationAssumptions: snapshot.simulationAssumptions,
};

const file = `window.comassetData = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync(outputPath, file);
console.log(`Wrote ${path.relative(root, outputPath)} from ${path.relative(root, snapshotPath)}.`);
