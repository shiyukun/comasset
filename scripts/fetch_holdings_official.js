const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const configPath = process.argv[2] || path.join(root, "config", "holdings_sources.json");
const outputPath = process.argv[3] || path.join(root, "data", "live_holdings.json");
const rawDirOverride = process.argv[4];
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const rawDir = path.resolve(root, rawDirOverride || config.rawDir || "data/issuer_holdings/raw");
const userAgent = process.env.SEC_USER_AGENT || "comasset-internal-research/0.1 contact@example.com";

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
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).replace(/[%$,]/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeWeight(value) {
  const parsed = toNumber(value);
  if (parsed === null) return null;
  return parsed > 1 ? parsed / 100 : parsed;
}

function firstValue(row, aliases) {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return "";
}

function readCsvRows(content) {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "").map((item) => item.trim());
  return lines.map((line) => Object.fromEntries(parseCsvLine(line).map((cell, index) => [headers[index], cell])));
}

function sectorFromAssetCategory(value) {
  const map = {
    EC: "Equity",
    DBT: "Debt",
    STIV: "Short-Term Investment Vehicle",
    DERIV: "Derivative",
    CURRENCY: "Currency",
    COM: "Commodity",
    ABS: "Asset-Backed",
  };
  return map[value] || value || "Unknown";
}

function calculateFundStats(fund) {
  fund.holdings = fund.holdings
    .filter((holding) => holding.name || holding.ticker)
    .sort((a, b) => (b.weight || 0) - (a.weight || 0));
  const sectorExposure = {};
  fund.holdings.forEach((holding) => {
    sectorExposure[holding.sector] = (sectorExposure[holding.sector] || 0) + (holding.weight || 0);
  });
  fund.top10Weight = fund.holdings.slice(0, 10).reduce((sum, holding) => sum + (holding.weight || 0), 0);
  fund.sectorExposure = Object.fromEntries(Object.entries(sectorExposure).sort((a, b) => b[1] - a[1]));
  return fund;
}

function fundFromCsv(target, content, sourcePath) {
  const rows = readCsvRows(content);
  const holdings = rows.map((row) => {
    const weight = normalizeWeight(
      firstValue(row, ["weight", "Weight", "% of Fund", "% of fund", "Market Value %", "pctVal"])
    );
    return {
      ticker: String(firstValue(row, ["holdingTicker", "Ticker", "ticker", "Symbol", "symbol", "CUSIP", "cusip"])).toUpperCase(),
      name: firstValue(row, ["name", "Name", "Security Name", "Holding Name", "Description", "Issuer"]),
      weight,
      sector: firstValue(row, ["sector", "Sector", "GICS Sector", "Asset Category"]) || "Unknown",
      country: firstValue(row, ["country", "Country", "invCountry"]) || "Unknown",
      shares: toNumber(firstValue(row, ["shares", "Shares", "balance", "Quantity"])),
      marketValue: toNumber(firstValue(row, ["marketValue", "Market Value", "valUSD", "Value"])),
      identifierType: row.CUSIP || row.cusip ? "CUSIP" : undefined,
    };
  });
  const firstRow = rows[0] || {};
  return calculateFundStats({
    ticker: target.ticker,
    issuer: target.issuer,
    type: target.type,
    asOf: firstValue(firstRow, ["asOf", "As Of", "Date"]) || null,
    expenseRatio: toNumber(firstValue(firstRow, ["expenseRatio", "Expense Ratio"])) ?? target.expenseRatio ?? null,
    aum: toNumber(firstValue(firstRow, ["aum", "AUM", "Net Assets"])) ?? null,
    sourceType: "issuer_csv",
    source: sourcePath,
    holdings,
  });
}

function tagValue(text, tag) {
  return text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() || null;
}

function attrValue(text, tag, attr) {
  return text.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"`))?.[1] || null;
}

async function secJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`${url} failed ${response.status}`);
  return response.json();
}

async function secText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/xml,text/xml,text/plain,*/*",
    },
  });
  if (!response.ok) throw new Error(`${url} failed ${response.status}`);
  return response.text();
}

function cikNoLeadingZeros(cik) {
  return String(Number(cik));
}

function cikPadded(cik) {
  return String(cik).padStart(10, "0");
}

async function fetchSecNportFund(target, cache) {
  const cik = cikPadded(target.sec.cik);
  const submissions = cache.submissions[cik] || (cache.submissions[cik] = await secJson(`https://data.sec.gov/submissions/CIK${cik}.json`));
  const recent = submissions.filings.recent;
  const forms = recent.form || [];
  const candidates = forms
    .map((form, index) => ({
      form,
      accession: recent.accessionNumber[index],
      filingDate: recent.filingDate[index],
    }))
    .filter((item) => item.form === "NPORT-P")
    .slice(0, target.sec.maxFilings || 80);

  for (const filing of candidates) {
    const accessionNoDash = filing.accession.replace(/-/g, "");
    const archiveUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros(cik)}/${accessionNoDash}/primary_doc.xml`;
    let xml = cache.xml[archiveUrl];
    if (!xml) {
      xml = await secText(archiveUrl);
      cache.xml[archiveUrl] = xml;
    }
    if (tagValue(xml, "seriesId") !== target.sec.seriesId) continue;

    const netAssets = toNumber(tagValue(xml, "netAssets"));
    const blocks = xml.match(/<invstOrSec>[\s\S]*?<\/invstOrSec>/g) || [];
    const holdings = blocks.map((block) => {
      const pctVal = toNumber(tagValue(block, "pctVal"));
      const valUSD = toNumber(tagValue(block, "valUSD"));
      const cusip = tagValue(block, "cusip");
      const isin = attrValue(block, "isin", "value");
      const assetCat = tagValue(block, "assetCat");
      const weight = pctVal !== null ? pctVal / 100 : netAssets && valUSD ? valUSD / netAssets : null;
      return {
        ticker: String(cusip || isin || tagValue(block, "title") || tagValue(block, "name") || "").toUpperCase(),
        name: tagValue(block, "name") || tagValue(block, "title") || "",
        weight,
        sector: sectorFromAssetCategory(assetCat),
        country: tagValue(block, "invCountry") || "Unknown",
        shares: tagValue(block, "units") === "NS" ? toNumber(tagValue(block, "balance")) : null,
        marketValue: valUSD,
        cusip,
        isin,
        identifierType: cusip ? "CUSIP" : isin ? "ISIN" : undefined,
        assetCategory: assetCat,
      };
    });
    return calculateFundStats({
      ticker: target.ticker,
      issuer: target.issuer,
      type: target.type,
      asOf: tagValue(xml, "repPdDate") || filing.filingDate,
      filingDate: filing.filingDate,
      accession: filing.accession,
      seriesId: target.sec.seriesId,
      classId: target.sec.classId,
      expenseRatio: target.expenseRatio ?? null,
      aum: netAssets,
      sourceType: "sec_nport",
      source: archiveUrl,
      holdings,
    });
  }
  throw new Error(`${target.ticker}: no recent NPORT-P matched series ${target.sec.seriesId}`);
}

async function fetchIssuerCsv(target) {
  if (!target.issuerCsvUrl) return null;
  const response = await fetch(target.issuerCsvUrl, {
    headers: { "User-Agent": "comasset-internal-research/0.1" },
  });
  if (!response.ok) throw new Error(`${target.ticker}: issuer CSV failed ${response.status}`);
  return response.text();
}

async function loadFund(target, cache) {
  const localPath = path.join(rawDir, `${target.ticker}.csv`);
  if (fs.existsSync(localPath)) {
    const content = fs.readFileSync(localPath, "utf8");
    const fund = fundFromCsv(target, content, path.relative(root, localPath));
    if (fund.holdings.length) return fund;
  }

  const issuerContent = await fetchIssuerCsv(target);
  if (issuerContent) {
    const fund = fundFromCsv(target, issuerContent, target.issuerCsvUrl);
    if (fund.holdings.length) return fund;
  }

  return fetchSecNportFund(target, cache);
}

(async () => {
  const cache = { submissions: {}, xml: {} };
  const funds = {};
  const errors = [];

  for (const target of config.targets) {
    try {
      funds[target.ticker] = await loadFund(target, cache);
    } catch (error) {
      errors.push(`${target.ticker}: ${error.message}`);
    }
  }

  const targetCount = config.targets.length;
  const coveredCount = Object.values(funds).filter((fund) => fund.holdings.length > 0).length;
  if (!coveredCount) {
    throw new Error(`No ETF/fund holdings imported.\n${errors.join("\n")}`);
  }

  const asOf = Object.values(funds)
    .map((fund) => fund.asOf)
    .filter(Boolean)
    .sort()
    .at(-1);

  const output = {
    asOf: asOf || new Date().toISOString().slice(0, 10),
    source: "official issuer CSV or SEC N-PORT fallback",
    rawDir: path.relative(root, rawDir),
    coverage: coveredCount / targetCount,
    targetCount,
    coveredCount,
    errors,
    funds,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Imported official holdings for ${coveredCount}/${targetCount} funds into ${path.relative(root, outputPath)}.`);
  if (errors.length) console.warn(errors.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
