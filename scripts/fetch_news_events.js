const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const candidatesPath = process.argv[2] || path.join(root, "data", "raw_candidates.json");
const cikMapPath = process.argv[3] || path.join(root, "data", "sec_ticker_map.json");
const outputPath = process.argv[4] || path.join(root, "data", "live_news_events.json");
const lookbackDays = Number(process.argv[5] || 60);
const maxNewsPerTicker = Number(process.argv[6] || 8);
const watchlistPath = process.argv[7] || path.join(root, "data", "custom_watchlist.json");
const secUserAgent = process.env.SEC_USER_AGENT || "comasset-internal-research/0.2 contact@example.com";
const retrievedAt = new Date().toISOString();

const raw = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const cikMap = fs.existsSync(cikMapPath) ? JSON.parse(fs.readFileSync(cikMapPath, "utf8")) : {};
const watchlist = fs.existsSync(watchlistPath) ? JSON.parse(fs.readFileSync(watchlistPath, "utf8")) : { items: [] };
const assetsByTicker = new Map(
  [...raw.candidates, ...(watchlist.items || [])].map((item) => [item.ticker, item])
);
const assets = [...assetsByTicker.values()];

const CATEGORY_RULES = [
  ["earnings", /earnings|results|revenue|profit|guidance|quarter|fiscal|outlook/i],
  ["regulatory", /regulat|antitrust|approval|probe|investigation|sec\b|sgx\b|fed\b|court|policy/i],
  ["capital_markets", /dividend|buyback|repurchase|offering|issuance|bond|debt|capital|split|listing/i],
  ["corporate_action", /acqui|merger|sale|spin.?off|restructur|partnership|joint venture/i],
  ["management", /ceo|cfo|chairman|director|management|appoint|resign/i],
  ["product", /launch|product|service|contract|customer|cloud|ai\b|capacity|route/i],
  ["litigation", /lawsuit|litigation|settlement|fine|penalty/i],
  ["macro", /interest rate|inflation|tariff|oil price|currency|recession|employment|geopolit/i],
];

const HIGH_IMPACT = new Set(["earnings", "regulatory", "corporate_action", "litigation"]);
const SEC_FORMS = new Set(["8-K", "8-K/A", "10-Q", "10-K", "6-K", "20-F", "DEF 14A", "S-3", "424B5"]);

function classify(text, fallback = "other") {
  const match = CATEGORY_RULES.find(([, pattern]) => pattern.test(text || ""));
  return match?.[0] || fallback;
}

function impactFor(category, title = "") {
  if (HIGH_IMPACT.has(category) || /guidance|merger|acquisition|fraud|bankrupt/i.test(title)) return "high";
  if (["capital_markets", "management", "product"].includes(category)) return "medium";
  return "low";
}

function decisionPressure(impact, confidence, publishedAt) {
  const ageDays = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 86400000);
  const impactScore = { high: 60, medium: 38, low: 18 }[impact] || 18;
  const confidenceScore = { high: 25, medium: 16, low: 8 }[confidence] || 8;
  const freshnessScore = ageDays <= 7 ? 15 : ageDays <= 30 ? 9 : 4;
  return Math.min(100, impactScore + confidenceScore + freshnessScore);
}

function pmScores(impact) {
  return {
    materialityScore: { high: 4, medium: 3, low: 2 }[impact] || 2,
    actionabilityScore: { high: 4, medium: 3, low: 2 }[impact] || 2,
    priority: { high: "high", medium: "medium", low: "low" }[impact] || "low",
  };
}

function cutoffDate() {
  return new Date(Date.now() - lookbackDays * 86400000);
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`request failed ${response.status}`);
  return response.json();
}

async function fetchText(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`request failed ${response.status}`);
  return response.text();
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rssTag(item, tag) {
  return decodeXml(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "");
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1];
    return {
      id: rssTag(item, "guid"),
      title: rssTag(item, "title"),
      description: rssTag(item, "description"),
      link: rssTag(item, "link"),
      publishedAt: new Date(rssTag(item, "pubDate")).toISOString(),
    };
  });
}

async function fetchYahooTickerRss(candidate) {
  const region = candidate.ticker.endsWith(".SI") ? "SG" : "US";
  const language = candidate.ticker.endsWith(".SI") ? "en-SG" : "en-US";
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(
    candidate.ticker
  )}&region=${region}&lang=${language}`;
  const xml = await fetchText(url, { "User-Agent": "comasset-internal-research/0.2" });
  const cutoff = cutoffDate();
  return parseRssItems(xml)
    .filter((item) => item.title && item.link && new Date(item.publishedAt) >= cutoff)
    .slice(0, maxNewsPerTicker)
    .map((item) => {
      const category = classify(`${item.title} ${item.description}`);
      const impact = impactFor(category, item.title);
      let publisher = "Yahoo Finance ticker RSS";
      try {
        publisher = new URL(item.link).hostname.replace(/^www\./, "");
      } catch (_error) {
        // Keep the feed label when the article URL is malformed.
      }
      return {
        id: `yahoo-rss-${item.id || Buffer.from(item.link).toString("base64url")}`,
        ticker: candidate.ticker,
        kind: "news",
        category,
        headline: item.title,
        summary: item.description || null,
        publisher,
        aggregator: "Yahoo Finance",
        publishedAt: item.publishedAt,
        sourceUrl: item.link,
        relatedTickers: [candidate.ticker],
        confidence: "medium",
        impact,
        decisionPressure: decisionPressure(impact, "medium", item.publishedAt),
        sourceType: "ticker_news_feed",
        sourceRank: 5,
        evidenceLabel: "Fact",
        timingConfidence: "confirmed",
        dateType: "hard_date",
        lastChecked: retrievedAt,
        ...pmScores(impact),
      };
    });
}

async function fetchYahooNews(candidate) {
  return fetchYahooTickerRss(candidate);
}

function secCategory(form, description) {
  if (["10-Q", "10-K", "20-F"].includes(form)) return "earnings";
  if (["S-3", "424B5"].includes(form)) return "capital_markets";
  return classify(description, form.startsWith("8-K") || form === "6-K" ? "corporate_event" : "regulatory");
}

async function fetchSecEvents(candidate) {
  const cik = cikMap[candidate.ticker];
  if (!cik) return [];
  const paddedCik = String(cik).padStart(10, "0");
  const payload = await fetchJson(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, {
    "User-Agent": secUserAgent,
    Accept: "application/json",
  });
  const recent = payload.filings?.recent || {};
  const cutoff = cutoffDate();
  return (recent.form || [])
    .map((form, index) => ({
      form,
      filingDate: recent.filingDate?.[index],
      accessionNumber: recent.accessionNumber?.[index],
      primaryDocument: recent.primaryDocument?.[index],
      description: recent.primaryDocDescription?.[index] || "",
    }))
    .filter((item) => SEC_FORMS.has(item.form) && item.filingDate && new Date(`${item.filingDate}T23:59:59Z`) >= cutoff)
    .map((item) => {
      const category = secCategory(item.form, item.description);
      const impact = impactFor(category, item.description);
      const accession = item.accessionNumber.replace(/-/g, "");
      const sourceUrl = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/${item.primaryDocument}`;
      const publishedAt = `${item.filingDate}T21:00:00.000Z`;
      return {
        id: `sec-${item.accessionNumber}-${item.primaryDocument}`,
        ticker: candidate.ticker,
        kind: "filing_event",
        category,
        headline: `${item.form}: ${item.description || "Company filing"}`,
        summary: `Official ${item.form} filing by ${payload.name || candidate.name}.`,
        publisher: "U.S. Securities and Exchange Commission",
        aggregator: null,
        publishedAt,
        sourceUrl,
        relatedTickers: [candidate.ticker],
        confidence: "high",
        impact,
        decisionPressure: decisionPressure(impact, "high", publishedAt),
        sourceType: "regulatory_filing",
        sourceRank: 3,
        evidenceLabel: "Fact",
        timingConfidence: "confirmed",
        dateType: "hard_date",
        lastChecked: retrievedAt,
        ...pmScores(impact),
        filing: {
          form: item.form,
          accessionNumber: item.accessionNumber,
          filingDate: item.filingDate,
        },
      };
    });
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.id || `${item.ticker}-${item.headline}-${item.publishedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

(async () => {
  const symbols = {};
  const errors = [];

  for (const candidate of assets) {
    const items = [];
    try {
      items.push(...(await fetchYahooNews(candidate)));
    } catch (error) {
      errors.push(`${candidate.ticker} Yahoo: ${error.message}`);
    }

    const isUsStock = candidate.type === "stock" && (candidate.country === "US" || (candidate.market || "US") === "US");
    if (isUsStock) {
      try {
        items.push(...(await fetchSecEvents(candidate)));
      } catch (error) {
        errors.push(`${candidate.ticker} SEC: ${error.message}`);
      }
    }

    const sorted = dedupe(items).sort((a, b) => {
      if (b.decisionPressure !== a.decisionPressure) return b.decisionPressure - a.decisionPressure;
      return b.publishedAt.localeCompare(a.publishedAt);
    });
    symbols[candidate.ticker] = {
      ticker: candidate.ticker,
      market: candidate.market || "US",
      itemCount: sorted.length,
      highImpactCount: sorted.filter((item) => item.impact === "high").length,
      latestPublishedAt: sorted.map((item) => item.publishedAt).sort().at(-1) || null,
      items: sorted,
    };
  }

  const covered = Object.values(symbols).filter((symbol) => symbol.itemCount > 0).length;
  const output = {
    asOf: retrievedAt,
    lookbackDays,
    sources: [
      {
        id: "yahoo_finance_news",
        type: "news_aggregator",
        name: "Yahoo Finance Search and ticker RSS news feeds",
      },
      {
        id: "sec_edgar_submissions",
        type: "official_regulatory_filing",
        name: "SEC EDGAR submissions API",
      },
    ],
    methodology: {
      framework: "Codex Public Equity Investing catalyst-calendar",
      note: "Headlines are classified for monitoring only and do not directly determine recommendation labels.",
    },
    coverage: {
      totalSymbols: assets.length,
      coveredSymbols: covered,
      ratio: assets.length ? covered / assets.length : 0,
    },
    errors,
    symbols,
  };

  if (!covered) throw new Error(`No news or events fetched.\n${errors.join("\n")}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `Fetched news/events for ${covered}/${assets.length} symbols into ${path.relative(root, outputPath)}.`
  );
  if (errors.length) console.warn(errors.join("\n"));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
