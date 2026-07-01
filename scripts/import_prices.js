const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || path.join(root, "data", "prices_sample.json");
const outputPath = process.argv[3] || path.join(root, "data", "prices_imported.json");

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map((item) => item.trim());
  const tickerIndex = headers.indexOf("ticker");
  const dateIndex = headers.indexOf("date");
  const closeIndex = headers.indexOf("close");
  if (tickerIndex < 0 || dateIndex < 0 || closeIndex < 0) {
    throw new Error("CSV must include ticker,date,close headers.");
  }

  const prices = {};
  lines.forEach((line) => {
    if (!line.trim()) return;
    const cells = line.split(",").map((item) => item.trim());
    const ticker = cells[tickerIndex].toUpperCase();
    if (!prices[ticker]) prices[ticker] = [];
    prices[ticker].push({
      date: cells[dateIndex],
      close: Number(cells[closeIndex]),
    });
  });
  Object.values(prices).forEach((series) => {
    series.sort((a, b) => a.date.localeCompare(b.date));
  });
  return {
    asOf: new Date().toISOString().slice(0, 10),
    currency: "USD",
    frequency: "custom",
    prices,
  };
}

function normalizeJson(content) {
  const parsed = JSON.parse(content);
  if (parsed.prices) return parsed;
  throw new Error("JSON must include a top-level prices object.");
}

const raw = fs.readFileSync(inputPath, "utf8");
const imported = inputPath.endsWith(".csv") ? parseCsv(raw) : normalizeJson(raw);

Object.entries(imported.prices).forEach(([ticker, series]) => {
  if (!Array.isArray(series) || series.length < 2) {
    throw new Error(`${ticker} must contain at least two price points.`);
  }
  series.forEach((point) => {
    if (!point.date || typeof point.close !== "number" || Number.isNaN(point.close)) {
      throw new Error(`${ticker} contains an invalid price point.`);
    }
  });
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(imported, null, 2)}\n`);
console.log(`Imported ${Object.keys(imported.prices).length} price series into ${path.relative(root, outputPath)}.`);
