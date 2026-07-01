const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const rawPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const cikMapPath = process.argv[3] || path.join(root, "data", "sec_ticker_map.json");
const outputPath = process.argv[4] || path.join(root, "data", "live_fundamentals.json");
const watchlistPath = process.argv[5] || path.join(root, "data", "custom_watchlist.json");
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const cikMap = JSON.parse(fs.readFileSync(cikMapPath, "utf8"));
const watchlist = fs.existsSync(watchlistPath)
  ? JSON.parse(fs.readFileSync(watchlistPath, "utf8"))
  : { items: [] };
const stockCandidates = [
  ...new Map(
    [...raw.candidates, ...(watchlist.items || [])]
      .filter((item) => item.type === "stock")
      .map((item) => [item.ticker, item])
  ).values(),
];
const skipped = stockCandidates
  .filter((item) => (item.market || "US") !== "US" && item.country !== "US" && item.currency !== "USD")
  .map((item) => `${item.ticker}: outside SEC companyfacts coverage`);
const tickers = stockCandidates
  .filter((item) => !skipped.some((message) => message.startsWith(`${item.ticker}:`)))
  .map((item) => item.ticker);
const userAgent = process.env.SEC_USER_AGENT || "comasset-internal-research/0.1 contact@example.com";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function fetchCompanyFacts(cik) {
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`SEC request failed ${response.status}`);
  return response.json();
}

function factsFor(payload, tag, unit = "USD") {
  return payload.facts?.["us-gaap"]?.[tag]?.units?.[unit] || [];
}

function latestAnnual(payload, tags, unit = "USD") {
  const facts = tags
    .flatMap((tag) => factsFor(payload, tag, unit).map((fact) => ({ ...fact, tag })))
    .filter((fact) => ["10-K", "10-K/A"].includes(fact.form) && fact.fp === "FY" && typeof fact.val === "number")
    .sort((a, b) => String(a.end).localeCompare(String(b.end)));
  const unique = [];
  const seen = new Set();
  for (let index = facts.length - 1; index >= 0; index -= 1) {
    const fact = facts[index];
    const key = `${fact.fy || ""}-${fact.end}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.unshift(fact);
    }
    if (unique.length >= 2) break;
  }
  return unique;
}

function growth(latest, previous) {
  if (!latest || !previous || !previous.val) return null;
  return latest.val / previous.val - 1;
}

function scoreFundamentals(metrics) {
  const revenue = metrics.revenueGrowth ?? 0;
  const income = metrics.netIncomeGrowth ?? 0;
  const fcf = metrics.freeCashFlowMargin ?? 0;
  return clamp(Math.round(55 + revenue * 120 + income * 45 + fcf * 70), 0, 100);
}

function scoreRisk(metrics) {
  const debtToEquity = metrics.debtToEquity ?? 1;
  return clamp(Math.round(90 - Math.max(0, debtToEquity - 1) * 18), 0, 100);
}

function summarizeCompany(ticker, cik, payload) {
  const revenue = latestAnnual(payload, [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "SalesRevenueNet",
  ]);
  const netIncome = latestAnnual(payload, ["NetIncomeLoss"]);
  const operatingCashFlow = latestAnnual(payload, ["NetCashProvidedByUsedInOperatingActivities"]);
  const capex = latestAnnual(payload, ["PaymentsToAcquirePropertyPlantAndEquipment"]);
  const assets = latestAnnual(payload, ["Assets"]);
  const liabilities = latestAnnual(payload, ["Liabilities"]);
  const equity = latestAnnual(payload, ["StockholdersEquity"]);

  const latestRevenue = revenue.at(-1);
  const latestOperatingCashFlow = operatingCashFlow.at(-1);
  const latestCapex = capex.at(-1);
  const latestLiabilities = liabilities.at(-1);
  const latestEquity = equity.at(-1);
  const freeCashFlow =
    latestOperatingCashFlow && latestCapex ? latestOperatingCashFlow.val - Math.abs(latestCapex.val) : null;

  const metrics = {
    revenueGrowth: growth(revenue.at(-1), revenue.at(-2)),
    netIncomeGrowth: growth(netIncome.at(-1), netIncome.at(-2)),
    freeCashFlowMargin: latestRevenue && freeCashFlow !== null ? freeCashFlow / latestRevenue.val : null,
    debtToEquity: latestLiabilities && latestEquity?.val ? latestLiabilities.val / latestEquity.val : null,
  };
  metrics.fundamentalsScore = scoreFundamentals(metrics);
  metrics.riskScore = scoreRisk(metrics);

  return {
    ticker,
    cik,
    entityName: payload.entityName,
    fiscalYear: latestRevenue?.fy || null,
    periodEnd: latestRevenue?.end || null,
    facts: {
      revenue: latestRevenue?.val || null,
      netIncome: netIncome.at(-1)?.val || null,
      operatingCashFlow: latestOperatingCashFlow?.val || null,
      capex: latestCapex?.val || null,
      assets: assets.at(-1)?.val || null,
      liabilities: latestLiabilities?.val || null,
      equity: latestEquity?.val || null,
      freeCashFlow,
    },
    metrics,
  };
}

(async () => {
  const companies = {};
  const errors = [...skipped];

  for (const ticker of tickers) {
    const cik = cikMap[ticker];
    if (!cik) {
      errors.push(`${ticker}: missing CIK mapping`);
      continue;
    }
    try {
      const payload = await fetchCompanyFacts(cik);
      companies[ticker] = summarizeCompany(ticker, cik, payload);
    } catch (error) {
      errors.push(`${ticker}: ${error.message}`);
    }
  }

  if (!Object.keys(companies).length) {
    throw new Error(`No SEC fundamentals fetched.\n${errors.join("\n")}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        asOf: new Date().toISOString(),
        source: "SEC companyfacts API",
        userAgent,
        errors,
        companies,
      },
      null,
      2
    )}\n`
  );
  console.log(`Fetched ${Object.keys(companies).length} SEC company facts into ${path.relative(root, outputPath)}.`);
  if (errors.length) console.warn(errors.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
