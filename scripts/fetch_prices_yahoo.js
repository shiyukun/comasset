const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const rawPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const outputPath = process.argv[3] || path.join(root, "data", "live_prices.json");
const monthsBack = Number(process.argv[4] || 18);
const watchlistPath = process.argv[5] || path.join(root, "data", "custom_watchlist.json");

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const watchlist = fs.existsSync(watchlistPath) ? JSON.parse(fs.readFileSync(watchlistPath, "utf8")) : { items: [] };
const assets = [...raw.candidates, ...(watchlist.items || [])];
const tickers = [...new Set([...assets.map((item) => item.ticker), "SPY", "QQQ", "SGDUSD=X", "CASH"])];
const currencies = Object.fromEntries(assets.map((item) => [item.ticker, item.currency || "USD"]));
currencies.SPY = "USD";
currencies.QQQ = "USD";
currencies["SGDUSD=X"] = "USD";
currencies.CASH = "USD";

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function weekKey(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weeklyLast(points) {
  const byWeek = new Map();
  points.forEach((point) => {
    byWeek.set(weekKey(point.date), point);
  });
  return [...byWeek.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function syntheticCashSeries(start, end) {
  const points = [];
  let value = 1;
  const date = new Date(start);
  while (date <= end) {
    points.push({ date: isoDate(date), close: Number(value.toFixed(6)) });
    value *= 1 + 0.0008;
    date.setUTCDate(date.getUTCDate() + 7);
  }
  return points;
}

async function fetchYahooTicker(ticker, start, end) {
  if (ticker === "CASH") return syntheticCashSeries(start, end);
  const period1 = Math.floor(start.getTime() / 1000);
  const period2 = Math.floor(end.getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}?period1=${period1}&period2=${period2}&interval=1d&events=history&includeAdjustedClose=true`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "comasset-internal-research/0.1",
    },
  });
  if (!response.ok) throw new Error(`${ticker}: Yahoo request failed ${response.status}`);
  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const adjusted = result?.indicators?.adjclose?.[0]?.adjclose || [];
  const close = result?.indicators?.quote?.[0]?.close || [];
  const points = timestamps
    .map((timestamp, index) => ({
      date: isoDate(new Date(timestamp * 1000)),
      close: Number((adjusted[index] ?? close[index])?.toFixed(6)),
    }))
    .filter((point) => point.close > 0);
  if (points.length < 2) throw new Error(`${ticker}: not enough price points`);
  return weeklyLast(points);
}

(async () => {
  const end = new Date();
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - monthsBack);
  const prices = {};
  const errors = [];

  for (const ticker of tickers) {
    try {
      prices[ticker] = await fetchYahooTicker(ticker, start, end);
    } catch (error) {
      errors.push(`${ticker}: ${error.message}`);
    }
  }

  if (!Object.keys(prices).length) {
    throw new Error(`No prices fetched.\n${errors.join("\n")}`);
  }

  const asOf = Object.values(prices)
    .flat()
    .map((point) => point.date)
    .sort()
    .at(-1);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        asOf,
        currency: "multi",
        currencies,
        frequency: "weekly",
        source: "Yahoo Finance public chart endpoint",
        errors,
        prices,
      },
      null,
      2
    )}\n`
  );
  console.log(`Fetched ${Object.keys(prices).length} price series into ${path.relative(root, outputPath)}.`);
  if (errors.length) console.warn(errors.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
