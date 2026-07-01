const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || path.join(root, "data", "holdings_template.csv");
const outputPath = process.argv[3] || path.join(root, "data", "live_holdings.json");

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function toNumber(value) {
  if (value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[%$,]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

const lines = fs.readFileSync(inputPath, "utf8").trim().split(/\r?\n/).filter(Boolean);
const headers = parseCsvLine(lines.shift() || "").map((item) => item.trim());
const rows = lines.map((line) => Object.fromEntries(parseCsvLine(line).map((cell, index) => [headers[index], cell])));
const funds = {};

rows.forEach((row) => {
  const fundTicker = String(row.fundTicker || "").toUpperCase();
  if (!fundTicker) return;
  if (!funds[fundTicker]) {
    funds[fundTicker] = {
      ticker: fundTicker,
      asOf: row.asOf || null,
      expenseRatio: toNumber(row.expenseRatio),
      aum: toNumber(row.aum),
      holdings: [],
    };
  }
  const weightRaw = toNumber(row.weight);
  const weight = weightRaw !== null && weightRaw > 1 ? weightRaw / 100 : weightRaw;
  funds[fundTicker].holdings.push({
    ticker: String(row.holdingTicker || "").toUpperCase(),
    name: row.name || "",
    weight,
    sector: row.sector || "Unknown",
    country: row.country || "Unknown",
    shares: toNumber(row.shares),
    marketValue: toNumber(row.marketValue),
  });
});

Object.values(funds).forEach((fund) => {
  fund.holdings.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  const sectorExposure = {};
  fund.holdings.forEach((holding) => {
    sectorExposure[holding.sector] = (sectorExposure[holding.sector] || 0) + (holding.weight || 0);
  });
  fund.top10Weight = fund.holdings.slice(0, 10).reduce((sum, holding) => sum + (holding.weight || 0), 0);
  fund.sectorExposure = Object.fromEntries(
    Object.entries(sectorExposure).sort((a, b) => b[1] - a[1])
  );
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ asOf: new Date().toISOString(), source: path.relative(root, inputPath), funds }, null, 2)}\n`
);
console.log(`Imported ${Object.keys(funds).length} fund holding files into ${path.relative(root, outputPath)}.`);
