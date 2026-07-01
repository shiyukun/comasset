const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputPath = process.argv[2] || path.join(root, "web", "data_status.js");

function readJson(filePath, fallback = {}) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

function modifiedAt(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(fs.statSync(filePath).mtime).replace(",", "") + " SGT";
}

function coverage(covered, total) {
  return total ? covered / total : 0;
}

const paths = {
  prices: path.join(root, "data", "live_prices.json"),
  fundamentals: path.join(root, "data", "live_fundamentals.json"),
  holdings: path.join(root, "data", "live_holdings.json"),
  macro: path.join(root, "data", "live_macro.json"),
  news: path.join(root, "data", "live_news_events.json"),
  snapshot: path.join(root, "snapshots", "latest.json"),
};
const raw = readJson(path.join(root, "data", "raw_candidates.json"), { candidates: [] });
const watchlist = readJson(path.join(root, "data", "custom_watchlist.json"), { items: [] });
const prices = readJson(paths.prices, { prices: {} });
const fundamentals = readJson(paths.fundamentals, { companies: {} });
const holdings = readJson(paths.holdings, { funds: {} });
const macro = readJson(paths.macro, { series: {} });
const news = readJson(paths.news, { symbols: {} });
const snapshot = readJson(paths.snapshot, { recommendations: [] });
const assets = [...new Map([...raw.candidates, ...watchlist.items].map((item) => [item.ticker, item])).values()];
const priceTargets = [...new Set([...assets.map((item) => item.ticker), "SPY", "QQQ", "SGDUSD=X", "CASH"])];
const secStockTargets = assets.filter(
  (item) => item.type === "stock" && (item.country === "US" || (item.market || "US") === "US")
);
const fundTargets = assets.filter((item) => item.type === "etf" || item.type === "fund");
const reviewed = snapshot.recommendations.filter((item) => item.codexAudit?.status === "reviewed").length;

const source = (id, name, nameZh, provider, cadence, cadenceZh, filePath, ratio, notes) => ({
  id,
  name,
  nameZh,
  provider,
  cadence,
  cadenceZh,
  status: ratio >= 0.8 ? "ready" : ratio > 0 ? "review" : "blocked",
  lastUpdated: modifiedAt(filePath) || "N/A",
  coverage: Number(ratio.toFixed(4)),
  notes,
});

const sources = [
  source(
    "prices", "Price History", "价格历史", prices.source || "Yahoo Finance", "6 hours", "每 6 小时",
    paths.prices,
    coverage(priceTargets.filter((ticker) => prices.prices?.[ticker]?.length).length, priceTargets.length),
    { zh: `覆盖 ${priceTargets.filter((ticker) => prices.prices?.[ticker]?.length).length}/${priceTargets.length} 条行情及基准序列。`, en: `Covers ${priceTargets.filter((ticker) => prices.prices?.[ticker]?.length).length}/${priceTargets.length} price and benchmark series.` }
  ),
  source(
    "fundamentals", "Fundamentals", "财务基本面", fundamentals.source || "SEC companyfacts", "Weekly", "每周",
    paths.fundamentals,
    coverage(secStockTargets.filter((item) => fundamentals.companies?.[item.ticker]).length, secStockTargets.length),
    { zh: `SEC 可覆盖美国股票 ${secStockTargets.filter((item) => fundamentals.companies?.[item.ticker]).length}/${secStockTargets.length}；新加坡股票仍需 SGX 数据源。`, en: `SEC covers ${secStockTargets.filter((item) => fundamentals.companies?.[item.ticker]).length}/${secStockTargets.length} U.S. stocks; Singapore names still require an SGX source.` }
  ),
  source(
    "fund_holdings", "ETF / Fund Holdings", "ETF / 基金持仓", holdings.source || "Issuer / SEC N-PORT", "Monthly", "每月",
    paths.holdings,
    coverage(fundTargets.filter((item) => holdings.funds?.[item.ticker]?.holdings?.length).length, fundTargets.length),
    { zh: `官方持仓覆盖 ${fundTargets.filter((item) => holdings.funds?.[item.ticker]?.holdings?.length).length}/${fundTargets.length} 只 ETF/基金。`, en: `Official holdings cover ${fundTargets.filter((item) => holdings.funds?.[item.ticker]?.holdings?.length).length}/${fundTargets.length} ETFs/funds.` }
  ),
  source(
    "macro", "Macro Indicators", "宏观指标", macro.source || "FRED", "Weekly", "每周",
    paths.macro,
    coverage(Object.keys(macro.series || {}).length, 8),
    { zh: `已取得 ${Object.keys(macro.series || {}).length}/8 组宏观序列。`, en: `Loaded ${Object.keys(macro.series || {}).length}/8 macro series.` }
  ),
  source(
    "news_events", "News and Events", "新闻与事件", "Yahoo Finance RSS + SEC EDGAR", "6 hours", "每 6 小时",
    paths.news,
    coverage(assets.filter((item) => news.symbols?.[item.ticker]?.items?.length).length, assets.length),
    { zh: `新闻或监管事件覆盖 ${assets.filter((item) => news.symbols?.[item.ticker]?.items?.length).length}/${assets.length} 个研究标的。`, en: `News or regulatory events cover ${assets.filter((item) => news.symbols?.[item.ticker]?.items?.length).length}/${assets.length} research symbols.` }
  ),
  source(
    "codex_public_equity_skill", "Codex Public Equity Investing Skill", "Codex 公开股票投资 Skill", "Codex review workflow", "After changed snapshot", "快照变化后复核",
    paths.snapshot,
    coverage(reviewed, snapshot.recommendations.length),
    { zh: `当前 ${reviewed}/${snapshot.recommendations.length} 条推荐与最新输入匹配并完成 Codex 复核；结构化评分不依赖此覆盖率。`, en: `${reviewed}/${snapshot.recommendations.length} recommendations currently have Codex review matched to the latest inputs; deterministic scoring does not depend on this coverage.` }
  ),
];

const output = {
  asOf: modifiedAt(paths.prices) || new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  sources,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `window.comassetDataStatus = ${JSON.stringify(output, null, 2)};\n`);
console.log(`Built ${path.relative(root, outputPath)} from live source coverage.`);
